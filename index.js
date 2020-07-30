import React, { Component } from 'react';
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
		account = {},
		filterOptions = [],
		getValue = () => {},
		...defaultProps
	} = props;

	const optionsObj = keyBy(options, 'value');

	return {
		...defaultProps,
		Cell: ({ row, value = {} }) => {
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
						onChange={e => onChange({ Id: row.Id, [id]: e })}
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
				return value.map((d, i) => (
					<div key={i}>
						<span>{fields.map(f => GetValue(f, d)).join(separator)}</span>
						<br />
					</div>
				));
			} else {
				return fields.map(f => GetValue(f, value)).join(separator);
			}
		},
		Filter: ({ column: { filterValue, setFilter } }) => {
			return (
				<Filter
					editable={editable}
					account={account}
					dropdown={dropdown}
					filterIds={filterIds}
					onChange={setFilter}
					options={filterOptions}
					value={filterValue ? filterValue : 'all'}
				/>
			);
		}
	};
};

class Filter extends Component {
	render() {
		let { options } = this.props;
		const { filterIds = [], onChange, value, account, dropdown, editable } = this.props;

		options = [{ value: 'all', label: 'All' }, ...options];
		options = filterIds.length != 0 ? options.filter(d => filterIds.includes(d.Id)) : options;

		if (options.length == 1) {
			if (options[0].value == 'all') {
				return (
					<div style={{ width: '100%' }}>
						<span>{options[0].label}</span>
					</div>
				);
			}
		}

		if (!editable) {
			let newValue = '';
			if (typeof dropdown === 'string') {
				newValue = account[dropdown];
			} else {
				let fieldArr = [];
				const { fields, separator } = dropdown;

				if (fields.length) {
					fields.map(f => {
						fieldArr.push(account[f]);
					});
				}

				newValue = fieldArr.join(separator);
			}

			return (
				<div style={{ width: '100%' }}>
					<span>{newValue}</span>
				</div>
			);
		}

		return (
			<Select
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
	}
}
