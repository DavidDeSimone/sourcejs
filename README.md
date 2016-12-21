A version control viewer for mecurial/git written for electron. Written in typescript and c++.


Building:

To build, you will need to download electron via

npm install electron

install node-gyp via
npm install node-gyp

build the native node module

cd src/cpp/ && ./build.sh

and build typescript via

npm install typescript && tsc in the root dir