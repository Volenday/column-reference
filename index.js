import React, { Component } from 'react';
import ReactSelect from 'react-select';
import keyBy from 'lodash/keyBy';

import { GetValue } from './utils';

export default props => {
	const {
		defaultValue = 'all',
		dropdown,
		editable = false,
		filterIds = [],
		headerStyle = {},
		id,
		multiple,
		onChange,
		options = [],
		style = {},
		...defaultProps
	} = props;

	const optionsObj = keyBy(options, 'value');

	return {
		...defaultProps,
		style: { ...style, overflow: editable ? 'visible' : 'hidden', display: 'flex', alignItems: 'center' },
		headerStyle: {
			...headerStyle,
			overflow: 'visible',
			display: 'flex',
			alignItems: 'center'
		},
		Cell: ({ index, original, value }) => {
			if (editable) {
				return (
					<div style={{ width: '100%' }}>
						<ReactSelect
							inputId={`${id}-${index}-cell`}
							value={value ? (optionsObj[value.Id] ? optionsObj[value.Id] : null) : null}
							onChange={e => onChange(e ? { Id: original.Id, [id]: e.value } : null)}
							options={options}
						/>
					</div>
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
		Filter: ({ filter, onChange }) => {
			return (
				<Select
					filterIds={filterIds}
					onChange={onChange}
					options={options}
					value={filter ? filter.value : defaultValue}
				/>
			);
		}
	};
};

class Select extends Component {
	render() {
		let { options } = this.props;
		const { filterIds = [], onChange, value } = this.props;

		options = options.length == 1 ? options : [{ value: 'all', label: 'All' }, ...options];
		options = filterIds.length != 0 ? options.filter(d => filterIds.includes(d.Id)) : options;
		const optionsObj = keyBy(options, 'value');

		// !isFetching &&
		if (options.length == 1) {
			if (options[0].value == 'all') {
				return (
					<div style={{ width: '100%' }}>
						<span>{options[0].label}</span>
					</div>
				);
			}
		}

		return (
			<div style={{ width: '100%' }}>
				<ReactSelect
					onChange={e => onChange(e.value === 'all' ? '' : e.value)}
					options={options}
					value={Array.isArray(value) ? optionsObj[value[0]] : optionsObj[value]}
				/>
			</div>
		);
	}
}
