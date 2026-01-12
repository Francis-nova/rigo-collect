import { createStorageProvider } from "@pkg/storage";
import indexConfig from "./index.config";

const Storage = createStorageProvider({
  provider: "cloudinary",
  cloudName: indexConfig.storage.cloudinary.cloudName!,
  apiKey: indexConfig.storage.cloudinary.apiKey!,
  apiSecret: indexConfig.storage.cloudinary.apiSecret!,
  folderDefault: "files",
});

export default Storage;