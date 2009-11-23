// -------------------------------------------------------------------
// markItUp!
// -------------------------------------------------------------------
// Copyright (C) 2008 Jay Salvat
// http://markitup.jaysalvat.com/
// -------------------------------------------------------------------
// MarkDown tags example
// http://en.wikipedia.org/wiki/Markdown
// http://daringfireball.net/projects/markdown/
// -------------------------------------------------------------------
// Feel free to add more tags
// -------------------------------------------------------------------
myMarkdownSettings = {
    nameSpace:       "markdown", // Useful to prevent multi-instances CSS conflict
    previewAutoRefresh:		false,
    onShiftEnter:		{keepDefault:false, openWith:'\n\n'},
	markupSet: [
		{name:gettext('First Level Heading'), key:'1', placeHolder:gettext('Your title here...'), closeWith:function(markItUp) { return miu.markdownTitle(markItUp, '=') } },
		{name:gettext('Second Level Heading'), key:'2', placeHolder:gettext('Your title here...'), closeWith:function(markItUp) { return miu.markdownTitle(markItUp, '-') } },
		{name:gettext('Heading 3'), key:'3', openWith:'### ', placeHolder:gettext('Your title here...') },
		{name:gettext('Heading 4'), key:'4', openWith:'#### ', placeHolder:gettext('Your title here...') },
		{name:gettext('Heading 5'), key:'5', openWith:'##### ', placeHolder:gettext('Your title here...') },
		{name:gettext('Heading 6'), key:'6', openWith:'###### ', placeHolder:gettext('Your title here...') },
		{separator:'---------------' },		
		{name:gettext('Bold'), key:'B', openWith:'**', closeWith:'**'},
		{name:gettext('Italic'), key:'I', openWith:'_', closeWith:'_'},
		{separator:'---------------' },
		{name:gettext('Bulleted List'), openWith:'- ' },
		{name:gettext('Numeric List'), openWith:function(markItUp) {
			return markItUp.line+'. ';
		}},
		{separator:'---------------' },
		{name:gettext('Picture'), key:'P', replaceWith:'![[![Alternative text]!]]([![Url:!:http://]!] "[![Title]!]")'},
		{name:gettext('Link'), key:'L', openWith:'[', closeWith:']([![Url:!:http://]!] "[![Title]!]")', placeHolder:'Your text to link here...' },
		{separator:'---------------'},	
		{name:gettext('Quotes'), openWith:'> '},
		{name:gettext('Code Block / Code'), openWith:'(!(\t|!|`)!)', closeWith:'(!(`)!)'},
		{separator:'---------------'},
		{name:gettext('Preview'), call:'preview', className:"preview"}
	]
}

// mIu nameSpace to avoid conflict.
miu = {
	markdownTitle: function(markItUp, char) {
		heading = '';
		n = $.trim(markItUp.selection||markItUp.placeHolder).length;
		for(i = 0; i < n; i++) {
			heading += char;
		}
		return '\n'+heading;
	}
}

//----------------------------------------------------------------------------
//Html tags
//http://en.wikipedia.org/wiki/html
//----------------------------------------------------------------------------
myHTMLSettings = {
	nameSpace:       "html", // Useful to prevent multi-instances CSS conflict
 	previewAutoRefresh:		false,
	onShiftEnter:	{keepDefault:false, replaceWith:'<br />\n'},
	onCtrlEnter:	{keepDefault:false, openWith:'\n<p>', closeWith:'</p>\n'},
	onTab:			{keepDefault:false, openWith:'	 '},
	markupSet: [
		{name:gettext('First Level Heading'), key:'1', openWith:'<h1(!( class="[![Class]!]")!)>', closeWith:'</h1>', placeHolder:gettext('Your title here...') },
		{name:gettext('Second Level Heading'), key:'2', openWith:'<h2(!( class="[![Class]!]")!)>', closeWith:'</h2>', placeHolder:gettext('Your title here...') },
		{name:gettext('Heading 3'), key:'3', openWith:'<h3(!( class="[![Class]!]")!)>', closeWith:'</h3>', placeHolder:gettext('Your title here...') },
		{name:gettext('Heading 4'), key:'4', openWith:'<h4(!( class="[![Class]!]")!)>', closeWith:'</h4>', placeHolder:gettext('Your title here...') },
		{name:gettext('Heading 5'), key:'5', openWith:'<h5(!( class="[![Class]!]")!)>', closeWith:'</h5>', placeHolder:gettext('Your title here...') },
		{name:gettext('Heading 6'), key:'6', openWith:'<h6(!( class="[![Class]!]")!)>', closeWith:'</h6>', placeHolder:gettext('Your title here...') },
		{name:gettext('Paragraph'), openWith:'<p(!( class="[![Class]!]")!)>', closeWith:'</p>' },
		{separator:'---------------' },
		{name:gettext('Bold'), key:'B', openWith:'(!(<strong>|!|<b>)!)', closeWith:'(!(</strong>|!|</b>)!)' },
		{name:gettext('Italic'), key:'I', openWith:'(!(<em>|!|<i>)!)', closeWith:'(!(</em>|!|</i>)!)' },
		{name:gettext('Stroke through'), key:'S', openWith:'<del>', closeWith:'</del>' },
		{separator:'---------------' },
		{name:gettext('Bulleted List'), openWith:'<ul>\n', closeWith:'</ul>\n' },
		{name:gettext('Numeric List'), openWith:'<ol>\n', closeWith:'</ol>\n' },
		{name:gettext('List element'), openWith:'<li>', closeWith:'</li>' },
		{separator:'---------------' },
		{name:gettext('Picture'), key:'P', replaceWith:'<img src="[![Source:!:http://]!]" alt="[![Alternative text]!]" />' },
		{name:gettext('Link'), key:'L', openWith:'<a href="[![Link:!:http://]!]"(!( title="[![Title]!]")!)>', closeWith:'</a>', placeHolder:gettext('Your text to link...') },
		{separator:'---------------' },
		{name:gettext('Clean'), className:'clean', replaceWith:function(markitup) { return markitup.selection.replace(/<(.*?)>/g, "") } },
		{name:gettext('Preview'), className:'preview', call:'preview' }
	]
}