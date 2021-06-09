import React, { memo, useEffect, useState } from 'react';
import { Button, Checkbox, Divider, Input, List, Popover } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';

import { GetValue } from './utils';

const Filter = ({ column, dropdown, id, options, setFilter }) => {
	const [selected, setSelected] = useState([]);
	const [newOptions, setNewOptions] = useState(options);
	const [isPopoverVisible, setIsPopoverVisible] = useState(false);

	const { fields, separator } = dropdown;

	useEffect(() => {
		if (!!column.filterValue) setSelected(column.filterValue);
	}, [JSON.stringify(column.filterValue)]);

	const selectItem = value => {
		if (selected.includes(value)) setSelected(selected.filter(d => d !== value));
		else setSelected([...selected, value]);
	};

	const renderItem = item => {
		return (
			<List.Item style={{ cursor: 'pointer', padding: '5px 0px' }}>
				<Checkbox checked={selected.includes(item.Id)} onChange={() => selectItem(item.Id)}>
					{fields.map(f => GetValue(f, item)).join(separator)}
				</Checkbox>
			</List.Item>
		);
	};

	const renderCount = () => {
		if (!column.filterValue) return null;
		if (!Array.isArray(column.filterValue)) return null;

		if (column.filterValue.length === 0) return null;
		return <span>({column.filterValue.length})</span>;
	};

	const handleSearch = value => {
		if (value === '') return setNewOptions(options);

		setNewOptions(
			options.filter(d =>
				fields
					.map(f => GetValue(f, d))
					.join(separator)
					.match(new RegExp(value, 'i'))
			)
		);
	};

	const filter = () => setFilter(id, selected);

	const renderPopoverContent = () => (
		<>
			<div>
				<h4>Filter {renderCount()}</h4>
				<Input.Search
					allowClear
					onKeyUp={e => handleSearch(e.target.value)}
					onSearch={handleSearch}
					placeholder="Search"
				/>
				<List dataSource={newOptions} renderItem={renderItem} style={{ height: 250, overflowY: 'scroll' }} />
			</div>
			<Divider />
			<div>
				<h4>Column Settings</h4>
				<Checkbox {...column.getToggleHiddenProps()}>Visible</Checkbox>
			</div>
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

	const openPopover = () => setIsPopoverVisible(true);
	const closePopover = () => setIsPopoverVisible(false);

	return (
		<Popover content={renderPopoverContent} trigger="click" visible={isPopoverVisible}>
			{!!column.filterValue ? (
				<FilterFilled onClick={openPopover} style={{ cursor: 'pointer' }} />
			) : (
				<FilterOutlined onClick={openPopover} style={{ cursor: 'pointer' }} />
			)}
		</Popover>
	);
};

export default memo(Filter);
