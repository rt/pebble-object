FROM debian:wheezy

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y curl vim tmux less git build-essential

## Java
ENV JAVA_VERSION_MAJOR 8
ENV JAVA_VERSION_MINOR 45
ENV JAVA_VERSION_BUILD 14
ENV JAVA_VERSION ${JAVA_VERSION_MAJOR}u${JAVA_VERSION_MINOR}
ENV JAVA_HOME /opt/java
RUN curl -jksSLH "Cookie: oraclelicense=accept-securebackup-cookie" \
    http://download.oracle.com/otn-pub/java/jdk/${JAVA_VERSION}-b${JAVA_VERSION_BUILD}/jdk-${JAVA_VERSION}-linux-x64.tar.gz \
    | tar xzf - -C /tmp &&\
    mv /tmp/jdk* ${JAVA_HOME} &&\
    ln -s ${JAVA_HOME}/bin/java /usr/bin/java
ENV PATH ${PATH}:${JAVA_HOME}/bin

WORKDIR /work

CMD ["bash", "/work/runTest.sh"]


