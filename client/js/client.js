var _ = require('lodash');
var Remarkable = require('remarkable');
var hljs = require('./highlight.pack.js') // https://highlightjs.org/
var Vue = require('vue');
var moment = require('moment');
var numeral = require('numeral');
var q = require('bluebird');
var request = require('superagent');
var route = require('page');
var domready = require('domready');
var Base64 = require('js-base64').Base64;

//Config
var md = new Remarkable('full', {
  html: false, // Enable HTML tags in source
  xhtmlOut: true, // Use '/' to close single tags (<br />)
  breaks: false, // Convert '\n' in paragraphs into <br>
  langPrefix: 'language-', // CSS language prefix for fenced blocks
  linkify: true, // autoconvert URL-like texts to links
  typographer: true, // Enable smartypants and other sweet transforms

  // Highlighter function. Should return escaped HTML,
  // or '' if input not changed
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      }
      catch (__) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    }
    catch (__) {}

    return ''; // use external default escaping
  }
});
// console.log(md.render('# Remarkable rulezz!'));

domready(function() {
  //Model
  var Model = new Vue({
      el: '#v-app',
      template: require('../html/app.html'),
      data: {
        currentRoute: '/',
        posts: []
        projects: []
      },
      methods: {
        goTo: function(path) {
          Model.currentRoute = path;
          route(path);
        }
      }
    })
    //Controllers
  var controller = {
    index: function(context) {
      console.log('index!');
    },
    allPosts: function(context) {
      console.log('allPosts!');
    },
    post: function(context) {
      var post = context.params.post;
      console.log('post!', post);
    },
    allProjects: function(context) {
      console.log('allProjects!');
    },
    project: function(context) {
      var project = context.params.project;
      console.log('project!');
    },
    notfound: function(context) {
      console.log('notfound! redirecting', window.location);
      route('/');
    }
  };
  //Get Posts
  var purposeURL =
    "https://api.github.com/repos/Utah-Node-Ninjas/unn-content/contents/purpose.md"
  request.get(purposeURL).success(function(data) {
    var markdown = Base64.decode(data.content);
    var purposeContent = md.render(markdown);
    // $('#purpose-content').html(purposeContent);
  }).error(function(e) {
    console.log(e, null)
  })
  //Get Projects


  //Routes
  route.base('/#');
  route('/', controller.index);
  route('/blog', controller.allPosts);
  route('/blog/:post', controller.post);
  route('/projects', controller.allProjects);
  route('/project/:project', controller.project);
  route('*', controller.notfound);
  route();
})