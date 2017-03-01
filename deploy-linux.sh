#cleans repository
git clean -f -d
git pull

#Runs required by the server
npm install
gulp build:dist

#restart linux service
systemctl restart enersa-dsm
