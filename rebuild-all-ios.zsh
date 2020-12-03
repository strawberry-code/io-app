nvm use v10.18.0
bundle install
watchman watch-del-all
rm -rf node_modules
npx yarn install
cd ios && pod install && cd ..
npx yarn generate:all
npx yarn start --reset-cache
open /Applications/Xcode.app
