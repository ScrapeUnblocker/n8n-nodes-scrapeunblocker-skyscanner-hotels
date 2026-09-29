import { SkyscannerHotelsScraper } from './nodes/SkyscannerHotelsScraper/SkyscannerHotelsScraper.node';
import { ApifyApi } from './credentials/ApifyApi.credentials';

export const nodeTypes = [SkyscannerHotelsScraper];

export const credentialTypes = [ApifyApi];
