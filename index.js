import React from 'react';
import { keyBy } from 'lodash';
import { Select } from 'antd';

import { GetValue } from './utils';

export default props => {
	const {
		dropdown,
		editable = false,
		filterIds = [],
		id,
		multiple,
		onChange,
		options = [],
		filterOptions = [],
		getValue = () => {},
		...defaultProps
	} = props;

	const optionsObj = keyBy(options, 'value');

	return {
		...defaultProps,
		Cell: ({ row: { original }, value = {} }) => {
			if (typeof value === 'undefined') return null;

			if (editable) {
				//if usertypes
				if (value) {
					if (typeof value.Level != 'undefined') {
						if (!optionsObj[value.Id]) {
							return <span>{value.Name}</span>;
						}
					}
				}

				const newOptions = getValue(value);

				return (
					<Select
						mode={multiple ? 'multiple' : 'default'}
						showSearch
						optionFilterProp="children"
						style={{ width: '100%' }}
						onChange={e => onChange({ Id: original.Id, [id]: e })}
						value={multiple ? (Array.isArray(value) ? value.map(d => d.Id) : []) : value ? value.Id : ''}>
						{newOptions.length
							? newOptions.map(d => (
									<Select.Option key={d.value} value={d.value}>
										{d.label}
									</Select.Option>
							  ))
							: options.map(d => (
									<Select.Option key={d.value} value={d.value}>
										{d.label}
									</Select.Option>
							  ))}
					</Select>
				);
			}

			if (!value) return null;
			const { fields, separator } = dropdown;

			if (multiple) {
				return (
					<div>
						{value.map((d, i) => (
							<div key={i}>
								<span>{fields.map(f => GetValue(f, d)).join(separator)}</span>
								<br />
							</div>
						))}
					</div>
				);
			} else {
				return <span>{fields.map(f => GetValue(f, value)).join(separator)}</span>;
			}
		},
		Filter: ({ column: { filterValue, setFilter } }) => {
			return (
				<Filter
					filterIds={filterIds}
					onChange={setFilter}
					options={filterOptions}
					value={filterValue ? filterValue : 'all'}
				/>
			);
		}
	};
};

const Filter = ({ filterIds = [], onChange, options, value }) => {
	options = [{ value: 'all', label: 'All' }, ...options];
	options = filterIds.length !== 0 ? options.filter(d => filterIds.includes(d.Id)) : options;

	if (options.length === 1) {
		if (options[0].value === 'all')
			return (
				<div style={{ width: '100%' }}>
					<span>{options[0].label}</span>
				</div>
			);
	}

	return (
		<Select
			allowClear
			showSearch
			style={{ width: '100%' }}
			onChange={e => onChange(e !== 'all' ? e : '')}
			placeholder="Search..."
			optionFilterProp="children"
			value={Array.isArray(value) ? value[0] : value}>
			{options.map(d => (
				<Select.Option key={d.value} value={d.value}>
					{d.label}
				</Select.Option>
			))}
		</Select>
	);
};
