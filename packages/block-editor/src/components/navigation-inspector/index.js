/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import NavigationOption from './navigation-option';
import { store as blockEditorStore } from '../../store';
import ListView from '../list-view';

const EMPTY_BLOCKS = [];

export default function __experimentalNavigationInspector() {
	const {
		selectedClientId,
		selectedNavigationId,
		firstNavigationId,
		navigationIds,
	} = useSelect( ( select ) => {
		const {
			__experimentalGetActiveBlockIdByBlockNames,
			__experimentalGetGlobalBlocksByName,
			getSelectedBlockClientId,
			getBlock,
		} = select( blockEditorStore );
		const selectedNavId = __experimentalGetActiveBlockIdByBlockNames(
			'core/navigation'
		);
		const navIds = __experimentalGetGlobalBlocksByName( 'core/navigation' );
		return {
			selectedClientId: getSelectedBlockClientId(),
			selectedNavigationId: selectedNavId,
			firstNavigationId: navIds?.[ 0 ] ?? null,
			navigationIds: navIds.map( ( navigationId ) => ( {
				navigationId,
				ref: getBlock( navigationId )?.attributes?.ref,
			} ) ),
		};
	}, [] );

	const [ menu, setCurrentMenu ] = useState(
		selectedNavigationId || firstNavigationId
	);

	useEffect( () => {
		if ( selectedNavigationId ) {
			setCurrentMenu( selectedNavigationId );
		}
	}, [ selectedNavigationId, selectedClientId ] );

	const { blocks } = useSelect(
		( select ) => {
			const { __unstableGetClientIdsTree } = select( blockEditorStore );
			const id = menu || firstNavigationId;
			return {
				blocks: id ? __unstableGetClientIdsTree( id ) : EMPTY_BLOCKS,
			};
		},
		[ menu, firstNavigationId ]
	);

	const isLoading = navigationIds.length > 0 && blocks.length === 0;
	const showSelectControl = navigationIds.length > 1 && ! isLoading;
	const hasMenus = navigationIds.length > 0;
	const showListView = ! isLoading && hasMenus;

	return (
		<div className="block-editor-navigation-inspector">
			{ showSelectControl && (
				<SelectControl
					value={ menu || firstNavigationId }
					onChange={ setCurrentMenu }
				>
					{ navigationIds.map( ( { navigationId, ref }, index ) => {
						return (
							<NavigationOption
								key={ navigationId }
								navigationId={ navigationId }
								postId={ ref }
								index={ index }
							/>
						);
					} ) }
				</SelectControl>
			) }
			{ isLoading && (
				<>
					<div className="block-editor-navigation-inspector__placeholder" />
					<div className="block-editor-navigation-inspector__placeholder is-child" />
					<div className="block-editor-navigation-inspector__placeholder is-child" />
				</>
			) }
			{ showListView && (
				<ListView
					blocks={ blocks }
					showNestedBlocks
					__experimentalFeatures
					__experimentalPersistentListViewFeatures
				/>
			) }
		</div>
	);
}
