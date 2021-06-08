import React, { memo, useEffect, useState } from 'react';
import { Checkbox, Input, List, Popover } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { remove, uniq } from 'lodash';

import { GetValue } from './utils';

const Filter = ({ column, dropdown, id, options, setFilter }) => {
	const [selected, setSelected] = useState(typeof column.filterValue !== 'undefined' ? [column.filterValue] : []);
	const [newOptions, setNewOptions] = useState(options);

	useEffect(() => {
		const prevSelected = JSON.parse(localStorage.getItem('prevSelected'));

		if (prevSelected && prevSelected.length > 0) {
			setSelected([...prevSelected, ...selected]);
			localStorage.setItem('prevSelected', JSON.stringify(remove(uniq([...prevSelected, ...selected]), null)));
		} else {
			if (!selected.includes(undefined))
				localStorage.setItem('prevSelected', JSON.stringify(remove(uniq([...selected]), null)));
		}
	}, []);

	const selectItem = (columnId, filterValue) => {
		if (selected.includes(filterValue)) {
			setFilter(
				columnId,
				selected.filter(d => d !== filterValue)
			);
		} else {
			setFilter(columnId, filterValue);
			setSelected([...selected, filterValue]);
		}
	};

	const renderItem = item => {
		const { fields, separator } = dropdown;

		return (
			<List.Item style={{ cursor: 'pointer' }}>
				<Checkbox checked={selected.includes(item.Id)} onChange={() => selectItem(id, item.Id)} />{' '}
				{fields.map(f => GetValue(f, item)).join(separator)}
			</List.Item>
		);
	};

	const handleSearch = value => {
		const { fields, separator } = dropdown;

		if (value === '') return setNewOptions(options);

		setNewOptions(
			newOptions.filter(d =>
				fields
					.map(f => GetValue(f, d))
					.join(separator)
					.match(value, 'i')
			)
		);
	};

	const renderPopoverContent = () => {
		return (
			<div>
				<Input.Search
					allowClear
					onKeyUp={e => handleSearch(e.target.value)}
					onSearch={handleSearch}
					placeholder="Search"
				/>
				<List dataSource={newOptions} renderItem={renderItem} style={{ height: 250, overflowY: 'scroll' }} />
			</div>
		);
	};

	return (
		<Popover content={renderPopoverContent} title="Filter" trigger="click">
			<FilterOutlined style={{ cursor: 'pointer' }} />
		</Popover>
	);
};

export default memo(Filter);
