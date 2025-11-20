// service worker version number
const sw_version = 1;
const idb_version = 1;

// cache name including version number
const cache_name = `web-app-cache-${sw_version}`;

// static files to cache
const static_files = [
	"/sw-registration.js",
	"/index.html",
	"/about/index.html",
	"/manifest.json",
	"/offline.html",
	"/src/img/icons/manifest-icon-192.maskable.png",
	"/src/img/icons/manifest-icon-512.maskable.png",
];

// routes to cache
const routes = ["/", "/about"];

// combine static files and routes to cache
const files_to_cache = [...routes, ...static_files];

const requests_to_retry_when_offline = [];

const idb_config = {
	name: "web-app-db",
	version: idb_version,
	stores: {
		requestStore: {
			name: `request-store`,
			keyPath: "timestamp",
		},
	},
};

// returns if the app is offline
const is_offline = () => !self.navigator.onLine;

// return if a request should be retried when offline, in this example, all POST, PUT, DELETE requests
// and requests that are listed in the requestsToRetryWhenOffline array
// you can adapt this function to your specific needs
const is_request_eligible_for_retry = ({ url, method }) => {
	return (
		["POST", "PUT", "DELETE"].includes(method) ||
		requests_to_retry_when_offline.includes(url)
	);
};

const create_indexed_db = ({ name, stores }) => {
	const request = self.indexedDB.open(name, 1);

	return new Promise((resolve, reject) => {
		request.onupgradeneeded = (e) => {
			const db = e.target.result;

			Object.keys(stores).forEach((store) => {
				const { name, keyPath } = stores[store];

				if (!db.objectStoreNames.contains(name)) {
					db.createObjectStore(name, { keyPath });
				}
			});
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
};

const get_store_factory =
	(db_name) =>
	({ name }, mode = "readonly") => {
		return new Promise((resolve, reject) => {
			const request = self.indexedDB.open(db_name, idb_version);

			request.onsuccess = (_e) => {
				const db = request.result;
				const transaction = db.transaction(name, mode);
				const store = transaction.objectStore(name);

				// return a proxy object for the IDBObjectStore, allowing for promise-based access to methods
				const store_proxy = new Proxy(store, {
					get(target, prop) {
						if (typeof target[prop] === "function") {
							return (...args) =>
								new Promise((resolve, reject) => {
									const req = target[prop].apply(target, args);

									req.onsuccess = () => resolve(req.result);
									req.onerror = (err) => reject(err);
								});
						}

						return target[prop];
					},
				});

				return resolve(store_proxy);
			};

			request.onerror = (_e) => reject(request.error);
		});
	};

const open_store = get_store_factory(idb_config.name);

// serialize request headers for storage in IndexedDB
const serialize_headers = (headers) => Object.fromEntries(headers.entries());

// store the request in IndexedDB
const store_request = async ({
	url,
	method,
	body,
	headers,
	mode,
	credentials,
}) => {
	const serialized_headers = serialize_headers(headers);

	try {
		// Read the body stream and convert it to text or ArrayBuffer
		let stored_body = body;

		if (body && body instanceof ReadableStream) {
			const cloned_body = body.tee()[0];
			stored_body = await new Response(cloned_body).arrayBuffer();
		}

		const timestamp = Date.now();
		const store = await open_store(idb_config.stores.requestStore, "readwrite");

		await store.add({
			timestamp,
			url,
			method,
			...(stored_body && { body: stored_body }),
			headers: serialized_headers,
			mode,
			credentials,
		});

		// register a sync event for retrying failed requests if Background Sync is supported
		if ("sync" in self.registration) {
			await self.registration.sync.register(`retry-request`);
		}
	} catch (_error) {}
};

// get the names of the caches of the current Service Worker and any outdated ones
const get_cache_storage_names = async () => {
	const cache_names = (await caches.keys()) || [];
	const outdated_cache_names = cache_names.filter(
		(name) => !name.includes(cache_name),
	);
	const latest_cache_name = cache_names.find((name) =>
		name.includes(cache_name),
	);

	return {
		latestCacheName: latest_cache_name,
		outdatedCacheNames: outdated_cache_names,
	};
};

// update outdated caches with the content of the latest one so new content is served immediately
// when the Service Worker is updated but it can't serve this new content yet on the first navigation or reload
const update_last_cache = async () => {
	const { latestCacheName, outdatedCacheNames } =
		await get_cache_storage_names();
	if (!latestCacheName || !outdatedCacheNames?.length) {
		return null;
	}

	const latest_cache = await caches.open(latestCacheName);
	const latest_cache_entries =
		(await latest_cache?.keys())?.map((c) => c.url) || [];

	for (const outdated_cache_name of outdatedCacheNames) {
		const outdated_cache = await caches.open(outdated_cache_name);

		for (const entry of latest_cache_entries) {
			const latest_cache_response = await latest_cache.match(entry);

			await outdated_cache.put(entry, latest_cache_response.clone());
		}
	}
};

// get all requests from IndexedDB that were stored when the app was offline
const get_requests = async () => {
	try {
		const store = await open_store(idb_config.stores.requestStore, "readwrite");
		return await store.getAll();
	} catch (err) {
		return err;
	}
};

// retry failed requests that were stored in IndexedDB when the app was offline
const retry_requests = async () => {
	const reqs = await get_requests();
	const requests = reqs.map(
		({ url, method, headers: serialized_headers, body, mode, credentials }) => {
			const headers = new Headers(serialized_headers);

			return fetch(url, { method, headers, body, mode, credentials });
		},
	);

	const responses = await Promise.allSettled(requests);
	const request_store = await open_store(
		idb_config.stores.requestStore,
		"readwrite",
	);
	const { keyPath } = idb_config.stores.requestStore;

	responses.forEach((response, index) => {
		const key = reqs[index][keyPath];

		// remove the request from IndexedDB if the response was successful
		if (response.status === "fulfilled") {
			request_store.delete(key);
		}
	});
};

// cache all files and routes when the Service Worker is installed
// add {cache: 'no-cache'} } to all requests to bypass the browser cache so content is always fetched from the server
const install_handler = (e) => {
	e.waitUntil(
		caches
			.open(cache_name)
			.then((cache) =>
				Promise.all([
					cache.addAll(
						files_to_cache.map(
							(file) => new Request(file, { cache: "no-cache" }),
						),
					),
					create_indexed_db(idb_config),
				]),
			)
			.catch((_err) => {}),
	);
};

// delete any outdated caches when the Service Worker is activated
const activate_handler = (e) => {
	e.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names
						.filter((name) => name !== cache_name)
						.map((name) => caches.delete(name)),
				),
			),
	);
};

// in case the caches response is a redirect, we need to clone it to set its "redirected" property to false
// otherwise the Service Worker will throw an error since this is a security restriction
const clean_redirect = async (response) => {
	const cloned_response = response.clone();
	const { headers, status, statusText } = cloned_response;

	return new Response(cloned_response.body, {
		headers,
		status,
		statusText,
	});
};

// the fetch event handler for the Service Worker that is invoked for each request
const fetch_handler = async (e) => {
	const { request } = e;

	e.respondWith(
		(async () => {
			try {
				// store requests to IndexedDB that are eligible for retry when offline and return the offline page
				// as response so no error is logged
				if (is_offline() && is_request_eligible_for_retry(request)) {
					await store_request(request);

					return await caches.match("/offline.html");
				}

				// try to get the response from the cache
				const response = await caches.match(request, {
					ignoreVary: true,
					ignoreSearch: true,
				});
				if (response) {
					return response.redirected ? clean_redirect(response) : response;
				}

				// if not in the cache, try to fetch the response from the network
				const fetch_response = await fetch(e.request);
				if (fetch_response) {
					return fetch_response;
				}
			} catch (_err) {
				// a fetch error occurred, serve the offline page since we don't have a cached response
				return await caches.match("/offline.html");
			}
		})(),
	);
};

// message handler for communication between the main thread and the Service Worker through postMessage
const message_handler = async ({ data }) => {
	const { type } = data;

	switch (type) {
		case "SKIP_WAITING": {
			const clients = await self.clients.matchAll({
				includeUncontrolled: true,
			});

			// if the Service Worker is serving 1 client at most, it can be safely skip waiting to update immediately
			if (clients.length < 2) {
				await self.skipWaiting();
				await self.clients.claim();
			}

			break;
		}

		// move the files of the new cache to the old one so when the user navigates to another page or reloads the
		// current one, the new content will be served immediately
		case "PREPARE_CACHES_FOR_UPDATE":
			await update_last_cache();

			break;

		// retry any requests that were stored in IndexedDB when the app was offline in browsers that don't
		// support Background Sync
		case "retry-requests":
			if (!("sync" in self.registration)) {
				await retry_requests();
			}

			break;
	}
};

const sync_handler = async (e) => {
	const { tag } = e;

	switch (tag) {
		case "retry-request":
			e.waitUntil(retry_requests());

			break;
	}
};

self.addEventListener("install", install_handler);
self.addEventListener("activate", activate_handler);
self.addEventListener("fetch", fetch_handler);
self.addEventListener("message", message_handler);
self.addEventListener("sync", sync_handler);
