
# Remove all node_modules and lock files
rm -rf node_modules **/node_modules package-lock.json **/package-lock.json

# Install dependencies
npm install

# Install workspace dependencies
npm run build --workspaces