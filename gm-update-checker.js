// Auto UserScript Updater
function UpdateChecker() { this.initialize.apply(this, arguments); };
UpdateChecker.prototype = {
    initialize: function(options) {
        this.extend(this, options);
        this.remote_version = null;
        this.check_update();
    },

    // Util
    extend: function(dist, source) {
        for (var property in source) {
            if(dist == source[property]) continue;
            if(source[property] !== undefined) dist[property] = source[property];
        }
        return dist;
    },

    // Render update information in HTML
    render_update_info: function() {
        var self = this;
        var newversion = document.createElement('div');
        newversion.setAttribute('id', 'gm_update_alert');
        var update_message = document.createElement('p');
        update_message.innerHTML = [
            '現在お使いのGreasemonkeyスクリプト \'',
            this.script_name,
            '(ver ', this.current_version, ')',
            '\' は新しいバージョン ',
            this.remote_version,
            ' が公開されています．アップデートしますか？'
        ].join('');

        var update_link = document.createElement('a');
        update_link.setAttribute('id', 'gm_update_alert_link');
        update_link.setAttribute('href', this.script_url);
        update_link.addEventListener('click', function() {
            var update_alert = document.getElementById('gm_update_alert');
            update_alert.parentNode.removeChild(update_alert);
        }, false);
        update_link.innerHTML =
            '[Yes]今すぐアップデートする';

        if(this.more_info_url) {
            var more_link = document.createElement('a');
            more_link.setAttribute('href', this.more_info_url);
            more_link.innerHTML = '（詳細情報）';
            update_message.appendChild(more_link);
        }

        var close_link = document.createElement('a');
        close_link.setAttribute('href', 'javascript:void(0);');
        close_link.addEventListener('click', function() {
            GM_wrap(GM_setValue)('last_check_day', self.beginning_of_day().toString());
            var update_alert = document.getElementById('gm_update_alert');
            update_alert.parentNode.removeChild(update_alert);
        }, false);
        close_link.innerHTML = [
            '[No]今はアップデートしない（日付が変わるまで有効）'
        ].join('');

        newversion.appendChild(update_message);
        newversion.appendChild(update_link);
        newversion.appendChild(close_link);
        document.body.appendChild(newversion);
    },

    add_update_info_style: function() {
        GM_addStyle(<><![CDATA[
            /* style(like CSS) for update information */
            #gm_update_alert {
                padding: 5px 0pt;
                background-color: #FFF280;
                color: #CC0099;
                width: 100%;
                position: fixed;
                z-index: 99;
                top: 0px;
                left: 0px;
                text-align: center;
                font-size: 11px;
                font-family: Tahoma;
            }

            #gm_update_alert p {
                margin: 0pt;
            }

            #gm_update_alert a:link {
                color: #333333;
            }

            #gm_update_alert > a:link {
                margin: 0.5em 1em 0pt 1em;
            }

            #gm_update_alert p + a:link,
            #gm_update_alert p + a:visited,
            #gm_update_alert p + a:active,
            #gm_update_alert p + a:hover {
                font-weight: bold;
            }
        ]]></>);
    },

    // Check script update remote
    check_update: function() {
        if(!this.has_need_for_check()) return;
        var user_script = this;
        GM_xmlhttpRequest({
            method: 'GET',
            url: this.script_url,
            onload: function(res) {
                user_script.remote_version = user_script.check_version(res.responseText);
                if(user_script.remote_version && user_script.remote_version > user_script.current_version) {
                    user_script.add_update_info_style();
                    user_script.render_update_info();
                } else {
                    GM_setValue('last_check_day', user_script.beginning_of_day().toString());
                }
            },
            onerror: function(res) { GM_log(res.status + ':' + res.responseText); }
        });
    },

    // Check the necessity for update: [Boolean]
    // return [true] if necessary
    has_need_for_check: function() {
        var last_check_day = new Date(GM_getValue('last_check_day', "Thu Jan 01 1970 00:00:00 GMT+0900"));
        var current_day = this.beginning_of_day();
        if(current_day > last_check_day) {
            return true;
        } else {
            return false;
        }
    },

    // Check version in remote script file: [String]
    check_version: function(string) {
        if(/\/\/\s?@version\s+([\d.]+)/.test(string)) {
            return RegExp.$1;
        } else {
            return null;
        }
    },

    beginning_of_day: function() {
        var now = new Date();
        return(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    }
};

if(typeof GM_getValue('last_check_day') == 'number')
    GM_setValue('last_check_day', "Thu Jan 01 1970 00:00:00 GMT+0900");
