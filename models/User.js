var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
	avatar:{ type: Types.Url },
	creatAt: { type: Types.Datetime, index: true },//First seen
	}, 'Permissions', {
	isAdmin: { type: Types.Boolean, label: 'Can access Keystone', index: true },//超级管理员！uid=1;
	isLeader: { type: Types.Boolean, label: '客户', index: true },//客服管理！
	isKf: { type: Types.Boolean, label: '坐席', index: true },//客服坐席！
	tags: { type: Types.Relationship, ref: 'UserTag', many: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});
User.schema.virtual('canCreateKf').get(function () {
	return this.isLeader;
});
User.schema.virtual('canAnswerCustomer').get(function () {
	return this.isKf;
});

/**
 * Relationships 关系定义是可选的；如果你不定义，只是关系的另一侧不会在管理界面中显示这一关系。关系域仍能如期工作。
 */
User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });
User.relationship({ ref: 'Room', path: 'rooms', refPath: 'author' });
User.relationship({ ref: 'Room', path: 'rooms', refPath: 'participants' });
User.relationship({ ref: 'ChatMeta', path: 'chatmetas', refPath: 'author' });
User.relationship({ ref: 'ChatMeta', path: 'chatmetas', refPath: 'lastHearFrom' });
User.relationship({ ref: 'Chat', path: 'chats', refPath: 'author' });



/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin, isLeader, isKf';
User.register();
