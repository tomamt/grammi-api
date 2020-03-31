FROM node:10.16.2-slim
ADD package.json /tmp/package.json
# Install node modules
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src
# Copy the source code
COPY . /src
ENV PORT=5000
# Expose the port
EXPOSE  5000
# Set the work directory
WORKDIR /src
CMD ["npm", "start"]