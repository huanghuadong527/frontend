import { createElement } from 'react';
import { Service } from '@/service';
import { combineEpics, Epic, ofType } from 'redux-observable';
import { catchError, from, map, mergeMap, of } from 'rxjs';
import { FETCH_ERROR, FETCH_RESOURCE } from '../types';
import { setMenus } from '@/store/reducers';
import { toArrayTree, mapTree, eachTree } from 'xe-utils';
import * as Icon from '@ant-design/icons';

const getIconComponent = (iconName: string) => {
	return createElement((Icon as any)[iconName]);
};

const getResourceData = () =>
	from(
		Service({
			url: '/system/menu/list',
			method: 'GET',
		})
	);

const epic: Epic = (action$: any) => {
	console.log(0);
	return action$.pipe(
		ofType(FETCH_RESOURCE),
		mergeMap(() => {
			console.log(1);
			return getResourceData().pipe(
				map((result) => {
					console.log(3);
					const menuTree = toArrayTree(result.data);
					let formatTree = mapTree(menuTree, (item) => {
						const params = {
							key: item.id.toString(),
							label: item.menuName,
						};
						if (item.menuType == 'C') {
							return {
								...params,
								path: item.path,
							};
						} else if (item.menuType == 'M') {
							return {
								...params,
								icon:
									item.icon && item.icon != ''
										? getIconComponent(item.icon!)
										: '',
							};
						}
						return params;
					});
					eachTree(formatTree, (item: any) => {
						if (item.children && item.children.length == 0) {
							Reflect.deleteProperty(item, 'children');
						}
					});
					return setMenus(formatTree);
				}),
				catchError(() => of({ type: FETCH_ERROR }))
			);
		}),
		catchError(() => of({ type: FETCH_ERROR }))
	);
};

export default combineEpics(epic);
