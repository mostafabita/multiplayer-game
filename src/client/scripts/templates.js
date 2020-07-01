export const messageTemplate = `
    <li class="list-group-item {{type}} alt-{{me}}">
        <span class="prefix">{{prefix}}</span>
        {{#if username}}
            {{#if me}}
                <strong class="username">@you</strong>
            {{/if}}
            {{#unless me}}
                <strong class="username">@{{username}}</strong>
            {{/unless}}
        {{/if}}
        <small class="date">{{date}}</small>
        {{#if content}}
            <span class="content"> : {{{message}}}<span>
        {{/if}}
    </li>`;
