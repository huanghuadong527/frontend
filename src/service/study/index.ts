import { Api } from '@/service';

/** 诗词列表 */
export const getPoemList = (params: object) => Api.get('/study/poem/list', params);
/** 诗词详情 */
export const getPoemById = (id: string | number) => Api.get(`/study/poem/${id}`);
/** 新增诗词 */
export const addPoem = (params: object) => Api.post('/study/poem', params);
/** 修改诗词 */
export const updatePoem = (params: object) => Api.put('/study/poem', params);
/** 删除诗词 */
export const deletePoem = (ids: string | number) => Api.delete(`/study/poem/${ids}`);

/** 术语列表 */
export const getTermList = (params: object) => Api.get('/study/term/list', params);
/** 术语详情 */
export const getTermById = (id: string | number) => Api.get(`/study/term/${id}`);
/** 新增术语 */
export const addTerm = (params: object) => Api.post('/study/term', params);
/** 修改术语 */
export const updateTerm = (params: object) => Api.put('/study/term', params);
/** 删除术语 */
export const deleteTerm = (ids: string | number) => Api.delete(`/study/term/${ids}`);

/** 单词列表 */
export const getWordList = (params: object) => Api.get('/study/word/list', params);
/** 单词详情 */
export const getWordById = (id: string | number) => Api.get(`/study/word/${id}`);
/** 新增单词 */
export const addWord = (params: object) => Api.post('/study/word', params);
/** 修改单词 */
export const updateWord = (params: object) => Api.put('/study/word', params);
/** 删除单词 */
export const deleteWord = (ids: string | number) => Api.delete(`/study/word/${ids}`);
