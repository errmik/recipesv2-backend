Best practices : 
https://dev.to/elalemanyo/how-to-install-docker-and-docker-compose-on-raspberry-pi-1mo

--restart docker on reboot
sudo systemctl enable docker



To build the docker image :

build image :
docker build --no-cache -t recipes-backend .
or
docker build --no-cache -t recipes-backend-linux-arm64 --platform linux/arm64/v8 .
docker build --no-cache -t recipes-backend-windows-local .


tag image : 
docker tag recipes-backend-linux-arm64 errmik/recipes-backend-node-mongo-arm64
docker tag recipes-backend-windows-local errmik/recipes-backend-node-mongo-windows-local

push to hobby-projects repo :
docker push errmik/recipes-backend-node-mongo-arm64
docker push errmik/recipes-backend-node-mongo-windows-local (:tagname)

--run with env file (1er lancement)
docker run --restart always --env-file ./conf/.env.recipes-backend -p 4000:4000 errmik/recipes-backend-node-mongo-arm64

-- relancer un container
docker start *containerid*


--stop container 
sudo docker stop youthful_satoshi

--delete container 
sudo docker container rm youthful_satoshi

--delete image
sudo docker image rm errmik/hobby-projects:latest
ou 
sudo docker image rm 4da2047d33ba