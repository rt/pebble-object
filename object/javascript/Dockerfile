
FROM debian:wheezy

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y curl less build-essential

# Nodejs
ENV NODEJS_VERSION 6.9.4
ENV NODEJS_HOME /opt/nodejs
RUN curl -sSL http://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.gz \
    | tar xzf - -C /tmp &&\
    mv /tmp/node-v${NODEJS_VERSION}-linux-x64 ${NODEJS_HOME} &&\
    ln -s ${NODEJS_HOME}/bin/node /usr/bin/node &&\
    ln -s ${NODEJS_HOME}/bin/npm /usr/bin/npm 

ENV PATH ${PATH}:${NODEJS_HOME}/bin

WORKDIR /work

CMD ["node", "/work/test.js"]
