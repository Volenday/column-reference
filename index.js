import React, { memo, Suspense, useRef } from 'react';
import { keyBy } from 'lodash';
import { Select, Skeleton } from 'antd';
import { Controller, useForm } from 'react-hook-form';

import { GetValue } from './utils';

export default ({
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
}) => {
	const optionsObj = keyBy(options, 'value');

	return {
		...defaultProps,
		Cell: props => (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Cell
					{...props}
					other={{
						dropdown,
						editable,
						getValue,
						id,
						multiple,
						onChange,
						options,
						optionsObj,
						styles: { width: '100%' }
					}}
				/>
			</Suspense>
		),
		Filter: props => (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Filter {...props} other={{ filterIds, options: filterOptions }} />
			</Suspense>
		)
	};
};

const Cell = memo(
	({
		other: { dropdown, editable, getValue, id, multiple, onChange, options, optionsObj, styles },
		row: { original },
		value = {}
	}) => {
		if (typeof value === 'undefined') return null;

		if (editable) {
			const formRef = useRef();

			const { control, handleSubmit } = useForm({
				defaultValues: {
					[id]: multiple ? (Array.isArray(value) ? value.map(d => d.Id) : []) : value ? value.Id : ''
				}
			});

			//if usertypes
			if (value) {
				if (typeof value.Level != 'undefined') {
					if (!optionsObj[value.Id]) {
						return <span>{value.Name}</span>;
					}
				}
			}

			const newOptions = getValue(value);

			const submit = data => onChange({ Id: original.Id, ...data });

			return (
				<form onSubmit={handleSubmit(submit)} ref={formRef} style={styles}>
					<Controller
						control={control}
						name={id}
						render={({ onChange, name, value }) => (
							<Select
								mode={multiple ? 'multiple' : 'default'}
								name={name}
								onChange={e => {
									onChange(e);
									formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
								}}
								optionFilterProp="children"
								showSearch
								value={
									multiple ? (Array.isArray(value) ? value.map(d => d.Id) : []) : value ? value : ''
								}>
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
						)}
					/>
				</form>
			);
		}

		if (!value) return null;
		const { fields, separator } = dropdown;

		if (multiple) {
			if (!Array.isArray(value)) return null;
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
	}
);

const Filter = memo(({ column: { filterValue, setFilter }, other: { filterIds = [], options } }) => {
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

	const { control, handleSubmit } = useForm({
		defaultValues: { filter: Array.isArray(filterValue) ? filterValue[0] : filterValue }
	});

	const formRef = useRef();

	const submit = data => setFilter(data.filter !== 'all' ? data.filter : '');

	return (
		<form onSubmit={handleSubmit(submit)} ref={formRef} style={{ width: '100%' }}>
			<Controller
				control={control}
				name="filter"
				render={({ name, onChange, value }) => (
					<Select
						allowClear
						name={name}
						onChange={e => {
							onChange(e);
							formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
						}}
						optionFilterProp="children"
						placeholder="Search..."
						showSearch
						value={value}>
						{options.map(d => (
							<Select.Option key={d.value} value={d.value}>
								{d.label}
							</Select.Option>
						))}
					</Select>
				)}
			/>
		</form>
	);
});
