#cleans repository
git reset --hard HEAD
git pull

#Runs required by the server
npm install
bower install
gulp build:linux #temp

#restart linux service
systemctl restart enersa-dsm
