export const GetValue = (fields, data) => {
	fields = fields.split('.');

	if (fields.length == 1) {
		return data[fields[0]];
	} else {
		let newFields = [...fields];
		newFields = newFields.reverse();

		let value = data[newFields.pop()];
		if (value) {
			while (newFields.length != 0) {
				const field = newFields.pop();
				const newValue = typeof value[field] !== 'undefined' ? value[field] : null;
				if (newValue !== null) {
					value = newValue;
				} else continue;
			}
			return value;
		} else {
			return '';
		}
	}
};
