# Build the actual script as a part of the multi-stage build. This will package
# all the scripts and node10 into a single binary. At the time of writing,
# only Node 10 was the latest available version through Zeit.
FROM node:10 as script

COPY       /src /opt
WORKDIR    /opt
RUN        npm install
RUN        npx pkg --output=inspector .
RUN        chmod +x inspector
#RUN        ./inspector


# The actual container inside which the inspections i.e. IDEA is run. This is a
# plain OpenJSK container.
FROM openjdk:8u151-jdk

# Copying over the previously built binary from the sidecar containiner into this
COPY       --from=script /opt/inspector /usr/local/bin/
RUN        chmod +x /usr/local/bin/inspector

RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
     vim \
     wget \
     maven \
     groovy
# Clean the APT cache to reduce the size of the container. This step is for
# hygiene and can be omitted if needed.
RUN        apt-get clean
RUN        rm -rf /var/lib/apt/lists/*

RUN groupadd -r ijinspector && useradd --no-log-init --gid ijinspector --home-dir /home/ijinspector --create-home ijinspector

WORKDIR    /home/ijinspector
USER       ijinspector:ijinspector

ARG IDEA_VERSION=ideaIC-2018.1.8

RUN curl https://download-cf.jetbrains.com/idea/${IDEA_VERSION}-no-jdk.tar.gz > /tmp/ideaIC-jdk.tar.gz \
  && mkdir idea-IC \
  && tar -x -C idea-IC --strip-components=1 -z -f /tmp/ideaIC-jdk.tar.gz \
  && rm /tmp/ideaIC-jdk.tar.gz

ENV IDEA_HOME="/home/ijinspector/idea-IC"

COPY --chown=ijinspector:ijinspector jdk.table.xml /etc/idea/config/options/
COPY --chown=ijinspector:ijinspector jdk.table.xml /home/ijinspector/.IdeaIC2018.1/config/options/jdk.table.xml

# Configure the path of the idea properties. IDEA uses this property to deduce
# where it should look for the jdk.table.xml file. If this property isn't set,
# it won't be able to find the jdk.table.xml file and it crashes and burns with
# all sorts of gibberish errors.
RUN        echo idea.config.path=/etc/idea/config >> /home/ijinspector/idea-IC/bin/idea.properties
# Set the permissions of the IDEA directory for hygiene purposes.
RUN        chmod -R 777 /etc/idea

USER       root
COPY       entrypoint.sh /


WORKDIR    /home/ijinspector
ENTRYPOINT ["/entrypoint.sh"]
