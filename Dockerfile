#
# Node.js Dockerfile
#
# https://github.com/dockerfile/nodejs
#

# Pull base image.
FROM dockerfile/python

# Install Node.js
RUN \
  cd /tmp && \
  wget http://nodejs.org/dist/node-latest.tar.gz && \
  tar xvzf node-latest.tar.gz && \
  rm -f node-latest.tar.gz && \
  cd node-v* && \
  ./configure && \
  CXX="g++ -Wno-unused-local-typedefs" make && \
  CXX="g++ -Wno-unused-local-typedefs" make install && \
  cd /tmp && \
  rm -rf /tmp/node-v* && \
  echo '\n# Node.js\nexport PATH="node_modules/.bin:$PATH"' >> /root/.bashrc

# RUN echo deb http://archive.ubuntu.com/ubuntu precise main universe > /etc/apt/sources.list
# RUN echo deb http://archive.ubuntu.com/ubuntu precise-updates main universe >> /etc/apt/sources.list

RUN apt-get update

# git
RUN apt-get install -y git-core

# Install imagemagick
RUN apt-get install -y imagemagick

# RUN apt-get install software-properties-common

# Add the PPA
RUN add-apt-repository ppa:dhor/myway
#RUN add-apt-repository -y ppa:jon-severinsson/ffmpeg

RUN apt-get update

# imagemagick
RUN apt-get install -y graphicsmagick

# phantomjs
RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64.tar.bz2
RUN tar xvjf phantomjs-1.9.8-linux-x86_64.tar.bz2
RUN mv phantomjs-1.9.8-linux-x86_64/bin/phantomjs /usr/local/bin/
RUN rm -f phantomjs-1.9.8-linux-x86_64.tar.bz2 && rm -rf phantomjs-1.9.8-linux-x86_64/bin/phantomjs

# RUN apt-get install -y phantomjs

# casperjs
RUN git clone https://github.com/n1k0/casperjs.git /usr/local/casperjs
RUN ln -sf /usr/local/casperjs/bin/casperjs /usr/local/bin/casperjs


# ffmpeg
#RUN apt-get install -y wget file python-software-properties
#RUN apt-get install -y ffmpeg
# RUN apt-get -y install ffmpeg libavcodec-extra-53

# festival - text to speach
RUN apt-get -y install festival

# pdftk poppler-utils ghostscript tesseract-ocr [https://github.com/nisaacson/pdf-extract]
#RUN apt-get install pdftk poppler-utils ghostscript tesseract-ocr

# openssl
RUN apt-get install -y openssl

ADD package.json /home/sdk/package.json
RUN cd /home/sdk && npm install

# cleanup

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Define working directory.
WORKDIR /data

# Define default command.
CMD ["bash"]