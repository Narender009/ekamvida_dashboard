echo "Switching to branch master"
git checkout master

echo "Building app..."
npm run build

echo "Deploying files to server..."
scp -P 48 -r build/* webserver@122.160.116.135:/var/www/admin-dashboard/

echo "Done!"



