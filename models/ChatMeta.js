/**
 * Created by dale.guo on 2/17/17.
 * ChatMeta meta data
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ChatMeta Model
 * ==========
 */
var ChatMeta = new keystone.List('ChatMeta');

ChatMeta.add({
	author: { type: Types.Relationship, ref: 'User', index: true },
	drupalUid: Types.Number,//TODO drupal 集成ID
	inputName: { type: Types.Text, required: true, index: true, default: '访客' },//进入聊天室输入的用户名
	navigator:{ type: Types.Text},//TODO
	platform: { type: Types.Text},//TODO https://github.com/bestiejs/platform.js#readme 
	ip:  { type: Types.Text, index: true },
	// geoip2:{},
	email:{ type: Types.Email, index: true },
	phone:{ type: Types.Text, index: true },
	creatAt: { type: Types.Datetime, index: true },//First seen
	activeAt: { type: Types.Datetime, index: true},//last_active_at
	lastHearFrom:{ type: Types.Relationship, ref: 'User', index: true }, //最后一次被回复人员！
	lastHearAt: { type: Types.Datetime, index: true},
});

// Provide access to Keystone


/**
 * Relationships
 */
ChatMeta.relationship({ ref: 'Chat', path: 'chats', refPath: 'chatMeta' });


/**
 * Registration
 */
ChatMeta.defaultColumns = 'inputName, email, phone, lastHearFrom, creatAt, lastHearAt, ip';
ChatMeta.register();
