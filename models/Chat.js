/**
 * Created by dale.guo on 2/17/17.
 * Chat messages
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Chat Model
 * ==========
 */
var Chat = new keystone.List('Chat');

Chat.add({
	room: { type: Types.Relationship, ref: 'Room', index: true },//room_id
	author: { type: Types.Relationship, ref: 'User', index: true, label: 'By' },//user_id
	content: { type: Types.Textarea},
	isSystem: { type: Types.Boolean, index: true },//系统消息//是否是管理员发送的消息？ 
	// file: { type: Types.LocalFile, required: true }, //file_id TODO:  audio video pdf...
	createdAt:  { type: Types.Datetime, index: true, default: Date.now },
	chatMeta: { type: Types.Relationship, ref: 'ChatMeta'},
});


/**
 * Relationships
 */
// Chat.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });


/**
 * Registration
 */
Chat.defaultColumns = 'room, author, content, isSystem, createdAt';
Chat.register();
