import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Divider, Input, List, Menu, Popover } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';

import { GetValue } from './utils';

const Filter = ({ column, dropdown, id, options, setFilter }) => {
	const [selected, setSelected] = useState([]);
	const [newOptions, setNewOptions] = useState(options);
	const [isPopoverVisible, setIsPopoverVisible] = useState(false);

	const savedFilters = useMemo(() => JSON.parse(localStorage.getItem('savedFilters')), [localStorage]);
	const selectedColumn = useMemo(() => localStorage.getItem('selectedColumn'), [localStorage]);

	useEffect(() => {
		if (savedFilters && savedFilters.length > 0) setSelected(savedFilters);
	}, []);

	const selectItem = useCallback(
		filterValue => {
			if (selected.includes(filterValue)) {
				setSelected(selected.filter(d => d !== filterValue));
				localStorage.setItem('savedFilters', JSON.stringify(selected.filter(d => d !== filterValue)));
			} else {
				setSelected([...selected, filterValue]);
				localStorage.setItem('savedFilters', JSON.stringify([...selected, filterValue]));
			}
		},
		[JSON.stringify(selected), setSelected]
	);

	const renderItem = useCallback(
		item => {
			const { fields, separator } = dropdown;

			return (
				<List.Item style={{ cursor: 'pointer' }}>
					<Checkbox checked={selected.includes(item.Id)} onChange={() => selectItem(item.Id)} />{' '}
					{fields.map(f => GetValue(f, item)).join(separator)}
				</List.Item>
			);
		},
		[JSON.stringify(selected), selectItem, GetValue]
	);

	const handleSearch = useCallback(
		value => {
			const { fields, separator } = dropdown;

			if (value === '') return setNewOptions(options);

			setNewOptions(
				newOptions.filter(d =>
					fields
						.map(f => GetValue(f, d))
						.join(separator)
						.match(new RegExp(value, 'i'))
				)
			);
		},
		[JSON.stringify(newOptions), setNewOptions]
	);

	const filter = useCallback(() => {
		if (selected.length > 0) selected.map(d => setFilter(id, d));
		else {
			setFilter(id, '');
			localStorage.setItem('selectedColumn', null);
		}
	}, [JSON.stringify(selected), id, setFilter]);

	const renderPopoverContent = useCallback(() => {
		return (
			<>
				<Menu>
					<Menu.ItemGroup title="Filter">
						<Input.Search
							allowClear
							onKeyUp={e => handleSearch(e.target.value)}
							onSearch={handleSearch}
							placeholder="Search"
						/>
						<List
							dataSource={newOptions}
							renderItem={renderItem}
							style={{ height: 250, overflowY: 'scroll' }}
						/>
					</Menu.ItemGroup>
					<Menu.ItemGroup title="Column Settings">
						<Menu.Item>
							<Checkbox {...column.getToggleHiddenProps()}>Visible</Checkbox>
						</Menu.Item>
					</Menu.ItemGroup>
				</Menu>
				<Divider />
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							width: '50%'
						}}>
						<Button onClick={closePopover} type="default">
							Cancel
						</Button>
						<Button onClick={filter} type="primary">
							OK
						</Button>
					</div>
				</div>
			</>
		);
	}, [JSON.stringify(newOptions), column, handleSearch, renderItem, closePopover, filter]);

	const openPopover = useCallback(() => {
		localStorage.setItem('selectedColumn', id);
		setIsPopoverVisible(true);
	}, [setIsPopoverVisible]);

	const closePopover = useCallback(() => {
		setIsPopoverVisible(false);
	}, [setIsPopoverVisible]);

	return (
		<Popover content={renderPopoverContent} trigger="click" visible={isPopoverVisible}>
			{savedFilters && selectedColumn && savedFilters.length > 0 && id === selectedColumn ? (
				<FilterFilled onClick={openPopover} style={{ cursor: 'pointer' }} />
			) : (
				<FilterOutlined onClick={openPopover} style={{ cursor: 'pointer' }} />
			)}
		</Popover>
	);
};

export default memo(Filter);
