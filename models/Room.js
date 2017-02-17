/**
 * Created by dale.guo on 2/17/17.
 * Chat rooms
 */

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Room Model
 * ==========
 */
var Room = new keystone.List('Room');

Room.add({
	name: { type: Types.Text, required: true, index: true, default: '房间名' },//room_name:company1/1001
	author: { type: Types.Relationship, ref: 'User', index: true },// 创建者 created_uid
	isPrivate:  { type: Types.Boolean, default: false, index: true },//默认都是 公开 TODO:暂无该聊天室，请联系管理员添加！
	joinKey: { type: Types.Text },
	createdAt:  { type: Types.Datetime, index: true, default: Date.now },
	activeAt:  { type: Types.Datetime, index: true, default: Date.now },// label: 'Last active time'
	participants: { type: Types.Relationship, ref: 'User', index: true, many: true },// 当前参与者！TODO:都有谁来过，通过message获得！ m.array.push(1);
});


/**
 * Relationships
 */
Room.relationship({ ref: 'Chat', path: 'chats', refPath: 'room' });


/**
 * Registration
 */
Room.defaultColumns = 'name, author, isPrivate, joinKey, createdAt, activeAt';
Room.register();
