FROM debian:wheezy

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y python

WORKDIR /work

CMD ["bash", "/work/runTest.sh"]


