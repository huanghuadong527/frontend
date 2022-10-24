import { Api } from '@/service';

export const toSwagger = () => Api.get('/tool/swagger');
