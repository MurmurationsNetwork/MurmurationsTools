> This project has been archived. Please see [MurmurMaps](https://github.com/MurmurationsNetwork/MurmurMaps) for the latest implementation of Murmurations node profile generation and other tools.

# Murmurations Tools

> _This project is licensed under the terms of the GNU General Public License v3.0_

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
