import React, { memo, useState } from 'react';
import { Checkbox, Input, List, Popover } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import { GetValue } from './utils';

const Filter = ({ column, dropdown, id, options, setFilter }) => {
	const [selected, setSelected] = useState([column.filterValue]);
	const [newOptions, setNewOptions] = useState(options);

	const selectItem = (columnId, filterValue) => {
		if (selected.includes(filterValue)) setFilter(columnId, '');
		else {
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

		if (value === '') setNewOptions(options);
		else setNewOptions(newOptions.filter(d => fields.map(f => GetValue(f, d)).join(separator) === value));
	};

	const renderPopoverContent = () => {
		return (
			<div>
				<Input.Search allowClear onSearch={handleSearch} placeholder="Search" />
				<List dataSource={newOptions} renderItem={renderItem} style={{ height: 300, overflow: 'scroll' }} />
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
