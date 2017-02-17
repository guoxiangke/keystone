/**
 * Created by dale.guo on 2/17/17.
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * UserTag Model @see PostCategory
 * ==================
 */

var UserTag = new keystone.List('UserTag', {
	autokey: { from: 'name', path: 'tag', unique: true },
});

UserTag.add({
	name: { type: Types.Text, required: true },
	author: { type: Types.Relationship, ref: 'User', index: true, }//创建者 created_uid
});

UserTag.relationship({ ref: 'User', path: 'tags', refPath: 'tags' });

UserTag.register();
