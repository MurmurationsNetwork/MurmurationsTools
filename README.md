# Murmurations Tools

> _This project is licensed under the terms of the GNU General Public License v3.0_

## Local Development with Murmurations Services and Frontend Mongo

1. Run Murmurations Services and Frontend Mongo.
2. Ensure Local `.env` is Set Up. The following is the default `.env` setup.

   ```bash
   PRIVATE_MONGO_HOST=frontend-mongo-service:27017
   PRIVATE_MONGO_PASS=password
   PRIVATE_MONGO_USER=admin

   PUBLIC_TOOLS_URL=http://murmurations-tools-service.default
   PUBLIC_LIBRARY_URL=http://library-app:8080
   PUBLIC_INDEX_URL=http://index-app:8080
   PUBLIC_DATA_PROXY_URL=http://data-proxy-app:8080

   # LOCAL
   PUBLIC_INDEX_URL_LOCAL=http://index.murmurations.developers
   ```

3. Modify `/etc/hosts` to point tools.murmurations.developers to 127.0.0.1.

   ```bash
   127.0.0.1       tools.murmurations.developers
   ```

4. Execute `make dev`.
5. Open <http://tools.murmurations.developers> in your browser.

## Development

```sh
# Install dependencies
npm install

# Install the hooks for husky
npm run prepare

# Don't forget to set your environment variables in the .env file!
npm run dev
```

Open up <http://localhost:3000> and you should be ready to go!

## Enabling IPFS

Profiles created in Tools can also be saved to IPFS as well as to your Mongo database. You will need access to an IPFS server and will have to set the credentials in your environment variables file.

You can enable IPFS functionality by changing the configuration in the `app/utils/settings.js` file:

```javascript
export const settings = {
    ipfsEnabled: true
};
```

Then save the file and restart/redeploy the app. To disable IPFS, set `ipfsEnabled` back to false and restart/redeploy again.

## Try it out

<https://test-tools.murmurations.network>
