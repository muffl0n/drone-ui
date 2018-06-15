import React, { Component } from "react";

import { repositorySlug } from "shared/utils/repository";
import {
	fetchSecretList,
	createSecret,
	deleteSecret,
} from "shared/utils/secrets";

import { branch } from "baobab-react/higher-order";
import { inject } from "config/client/inject";

import { List, Item, Form } from "./components";

import styles from "./index.less";

const binding = (props, context) => {
	const { namespace, name } = props.match.params;
	const slug = repositorySlug(namespace, name);
	return {
		loaded: ["secrets", "loaded"],
		secrets: ["secrets", "data", slug],
	};
};

@inject
@branch(binding)
export default class RepoSecrets extends Component {
	constructor(props, context) {
		super(props, context);

		this.handleSave = this.handleSave.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.secrets !== nextProps.secrets;
	}

	componentWillMount() {
		const { namespace, name } = this.props.match.params;
		this.props.dispatch(fetchSecretList, this.props.drone, namespace, name);
	}

	handleSave(e) {
		const { dispatch, drone, match } = this.props;
		const { namespace, name } = match.params;
		const secret = {
			name: e.detail.name,
			value: e.detail.value,
			event: e.detail.event,
		};

		dispatch(createSecret, drone, namespace, name, secret);
	}

	handleDelete(secret) {
		const { dispatch, drone, match } = this.props;
		const { namespace, name } = match.params;
		dispatch(deleteSecret, drone, namespace, name, secret.name);
	}

	render() {
		const { secrets, loaded } = this.props;

		if (!loaded) {
			return LOADING;
		}

		return (
			<div className={styles.root}>
				<div className={styles.left}>
					{Object.keys(secrets || {}).length === 0 ? EMPTY : undefined}
					<List>
						{Object.values(secrets || {}).map(renderSecret.bind(this))}
					</List>
				</div>
				<div className={styles.right}>
					<Form onsubmit={this.handleSave} />
				</div>
			</div>
		);
	}
}

function renderSecret(secret) {
	return (
		<Item
			name={secret.name}
			event={secret.event}
			ondelete={this.handleDelete.bind(this, secret)}
		/>
	);
}

const LOADING = <div className={styles.loading}>Loading</div>;

const EMPTY = (
	<div className={styles.empty}>There are no secrets for this repository.</div>
);
