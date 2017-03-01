#cleans repository
git clean -f -d
git pull

#Runs required by the server
npm install
gulp

#resart service
systemctl restart enersa-dsm
