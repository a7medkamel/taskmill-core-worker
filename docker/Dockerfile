# https://hub.docker.com/_/node/

FROM node:latest

# Set environment variables.
ENV HOME /root

# Define working directory.
WORKDIR /root

# Define default command.
CMD ["bash"]

RUN sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list

RUN apt-get update

# essential
RUN apt-get install -y build-essential software-properties-common wget

# openssl
RUN apt-get install -y openssl

# Install Python.
RUN apt-get install -y python python-dev python-pip python-virtualenv

# install 'git' too?
# Install git
RUN apt-get install -y git-core

# Add the PPA
# RUN add-apt-repository ppa:dhor/myway
# RUN add-apt-repository "deb http://ppa.launchpad.net/dhor/myway/ubuntu trusty main"


# Install imagemagick
RUN apt-get install -y imagemagick

# Install libvips [sharp.io]
RUN add-apt-repository -y "deb http://ppa.launchpad.net/lovell/trusty-backport-vips/ubuntu trusty main"
RUN apt-get update
RUN apt-get install -y libvips-dev libgsf-1-dev

# Install graphicsmagick
# RUN add-apt-repository "deb http://ppa.launchpad.net/rwky/graphicsmagick/ubuntu utopic main"
# RUN apt-get update
# RUN apt-get install -y graphicsmagick

# RUN curl -s https://raw.githubusercontent.com/lovell/sharp/master/preinstall.sh | bash -

# Install phantomjs
# RUN add-apt-repository "deb http://ppa.launchpad.net/tanguy-patte/phantomjs/ubuntu trusty main"
# RUN apt-get update
# RUN apt-get install -y phantomjs

# RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64.tar.bz2
# RUN tar xvjf phantomjs-1.9.8-linux-x86_64.tar.bz2
# RUN mv phantomjs-1.9.8-linux-x86_64/bin/phantomjs /usr/local/bin/
# RUN rm -f phantomjs-1.9.8-linux-x86_64.tar.bz2 && rm -rf phantomjs-1.9.8-linux-x86_64/bin/phantomjs

# Install casperjs
# RUN git clone https://github.com/n1k0/casperjs.git /usr/local/casperjs
# RUN ln -sf /usr/local/casperjs/bin/casperjs /usr/local/bin/casperjs


# ffmpeg
#RUN apt-get install -y wget file python-software-properties
#RUN apt-get install -y ffmpeg
# RUN apt-get -y install ffmpeg libavcodec-extra-53

# festival - text to speach
# RUN apt-get -y install festival

# pdftk poppler-utils ghostscript tesseract-ocr [https://github.com/nisaacson/pdf-extract]
#RUN apt-get install pdftk poppler-utils ghostscript tesseract-ocr

# We should do this outside the image??
# ADD package.json /home/worker/package.json
# RUN cd /home/worker && npm install

# cleanup

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Define working directory.
WORKDIR /home/worker

ADD ./ /home/worker/
