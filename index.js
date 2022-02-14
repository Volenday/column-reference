import React, { memo, Suspense, useRef } from 'react';
import { keyBy } from 'lodash';
import { Select, Skeleton } from 'antd';
import reactStringReplace from 'react-string-replace';
import striptags from 'striptags';

import Filter from './filter';

import { GetValue } from './utils';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

const ColumnReference = ({
	dropdown,
	editable = false,
	filterIds = [],
	filterOptions = [],
	getValue = () => {},
	id,
	keywords = '',
	loading = false,
	multiple,
	onChange,
	options = [],
	stripHTMLTags = false,
	...defaultProps
}) => {
	const optionsObj = keyBy(options, 'value');

	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell
						{...props}
						other={{
							dropdown,
							editable,
							getValue,
							id,
							keywords,
							multiple,
							onChange,
							options,
							optionsObj,
							stripHTMLTags,
							styles: { width: '100%' }
						}}
					/>
				</Suspense>
			) : null,
		Filter: props => {
			return browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Filter {...props} dropdown={dropdown} id={id} options={filterOptions} loading={loading} />
				</Suspense>
			) : null;
		}
	};
};

const removeHTMLEntities = (text, multiple) => {
	const elem = multiple ? document.createElement('div') : document.createElement('span');
	return text.replace(/&[#A-Za-z0-9]+;/gi, entity => {
		elem.innerHTML = entity;
		return elem.innerText;
	});
};

const highlightsKeywords = (keywords, stripHTMLTags = false, toConvert, multiple) => {
	const strip = stripHTMLTags ? removeHTMLEntities(striptags(toConvert), multiple) : toConvert;

	const replaceText =
		keywords !== '' ? (
			reactStringReplace(strip, new RegExp('(' + keywords + ')', 'gi'), (match, index) => {
				return multiple ? (
					<div key={`${match}-${index}`} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
						{match}
					</div>
				) : (
					<span key={`${match}-${index}`} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
						{match}
					</span>
				);
			})
		) : multiple ? (
			<div>{strip}</div>
		) : (
			<span>{strip}</span>
		);

	return replaceText;
};

const Cell = memo(
	({
		other: {
			dropdown,
			editable,
			getValue,
			id,
			keywords,
			multiple,
			onChange,
			options,
			optionsObj,
			stripHTMLTags,
			styles
		},
		row: { original },
		value = {}
	}) => {
		if (typeof value === 'undefined') return null;

		if (editable) {
			const { Controller, useForm } = require('react-hook-form');
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
			return stripHTMLTags
				? highlightsKeywords(
						keywords,
						true,
						`<div>${value.map(d => fields.map(f => GetValue(f, d)).join(separator)).join(', ')}</div>`
				  )
				: highlightsKeywords(
						keywords,
						false,
						`<div>${value.map(d => fields.map(f => GetValue(f, d)).join(separator)).join(', ')}</div>`
				  );
		} else {
			if (typeof dropdown === 'string')
				return stripHTMLTags
					? highlightsKeywords(keywords, true, `<span>${dropdown}</span>`)
					: highlightsKeywords(keywords, false, `<span>${dropdown}</span>`);
			return stripHTMLTags
				? highlightsKeywords(
						keywords,
						true,
						`<span>${fields.map(f => GetValue(f, value)).join(separator)}</span>`
				  )
				: highlightsKeywords(
						keywords,
						false,
						`<span>${fields.map(f => GetValue(f, value)).join(separator)}</span>`
				  );
		}
	}
);

export default ColumnReference;
