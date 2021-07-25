FROM debian:wheezy

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y mono-complete

WORKDIR /work

CMD ["bash", "/work/runTest.sh"]


