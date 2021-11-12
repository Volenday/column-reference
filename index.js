import React, { memo, Suspense } from 'react';
import { Skeleton } from 'antd';

import Filter from './filter';

import { GetValue } from './utils';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

const ColumnReference = ({ dropdown, id, multiple, filterOptions = [], loading = false, ...defaultProps }) => {
	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell {...props} other={{ dropdown, multiple }} />
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

const Cell = memo(({ other: { dropdown, multiple }, value = {} }) => {
	if (!value || typeof value === 'undefined') return null;

	const { fields, separator } = dropdown;

	if (multiple) {
		if (!Array.isArray(value)) return null;
		return <div>{value.map(d => fields.map(f => GetValue(f, d)).join(separator)).join(', ')}</div>;
	}

	if (typeof dropdown === 'string') return <span>{dropdown}</span>;
	return <span>{fields.map(f => GetValue(f, value)).join(separator)}</span>;
});

export default ColumnReference;
