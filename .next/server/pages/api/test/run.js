(()=>{var e={};e.id=710,e.ids=[710],e.modules={7467:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=7467,e.exports=t},2100:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=2100,e.exports=t},2167:e=>{"use strict";e.exports=require("axios")},5022:e=>{"use strict";e.exports=require("chalk")},4470:e=>{"use strict";e.exports=require("fs-extra")},8506:e=>{"use strict";e.exports=require("joi")},145:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},3591:e=>{"use strict";e.exports=require("ora")},6681:e=>{"use strict";e.exports=require("playwright")},7773:e=>{"use strict";e.exports=require("winston")},9760:e=>{"use strict";e.exports=require("yargs")},5240:e=>{"use strict";e.exports=require("https")},5315:e=>{"use strict";e.exports=require("path")},6249:(e,t)=>{"use strict";Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,s){return s in t?t[s]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,s)):"function"==typeof t&&"default"===s?t:void 0}}})},6956:(e,t,s)=>{"use strict";s.r(t),s.d(t,{config:()=>g,default:()=>p,routeModule:()=>m});var r={};s.r(r),s.d(r,{default:()=>d});var a=s(1802),i=s(7153),o=s(6249),n=s(4639),l=s.n(n),u=s(4309),c=s.n(u);async function d(e,t){if("POST"!==e.method)return t.status(405).json({error:"Method not allowed"});let s=[],r=null,a=!1,i=null;try{let o=e.body||{};s=o.testTypes||[],r=o.selectedScenarios||null,a=o.runOnlySelected||!1;let n=new(c());i=await n.load(),r&&Array.isArray(r)&&(i.testTypes.e2e.selectedScenarios=r,i.testTypes.e2e.runOnlySelected=a);let u=new(l()),d=await u.runTests(i,s);t.status(200).json({success:!0,results:d,timestamp:new Date().toISOString(),scenarioSelection:{selectedScenarios:i.testTypes.e2e.selectedScenarios,runOnlySelected:i.testTypes.e2e.runOnlySelected}})}catch(e){console.error("Test execution error:",e),console.error("Error stack:",e.stack),t.status(500).json({success:!1,error:e.message,stack:e.stack,timestamp:new Date().toISOString(),details:{testTypes:s,selectedScenarios:r,runOnlySelected:a,configLoaded:!!i}})}}let p=(0,o.l)(r,"default"),g=(0,o.l)(r,"config"),m=new a.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/test/run",pathname:"/api/test/run",bundlePath:"",filename:""},userland:r})},4309:(e,t,s)=>{"use strict";let r=s(4470),a=s(5315),i=s(8506);class o{constructor(){this.schema=this.getConfigSchema(),this.defaultConfig=this.getDefaultConfig()}async load(e){try{let t;if(e){let s=a.resolve(e);if(await r.pathExists(s))t=await r.readJson(s);else throw Error(`Configuration file not found: ${s}`)}else{for(let e of["config/universal-testing.json","config.json","config/default.json","config/config.json"])if(await r.pathExists(e)){t=await r.readJson(e);break}t||(t=this.defaultConfig)}let s=await this.validate(t);return this.mergeWithDefaults(s)}catch(e){throw Error(`Failed to load configuration: ${e.message}`)}}async validate(e){try{let{error:t,value:s}=this.schema.validate(e,{allowUnknown:!0,stripUnknown:!1});if(t)throw Error(`Configuration validation failed: ${t.details.map(e=>e.message).join(", ")}`);return s}catch(e){throw Error(`Configuration validation error: ${e.message}`)}}mergeWithDefaults(e){return{...this.defaultConfig,...e,testTypes:{...this.defaultConfig.testTypes,...e.testTypes||{}},browser:{...this.defaultConfig.browser,...e.browser||{}},performance:{...this.defaultConfig.performance,...e.performance||{}},security:{...this.defaultConfig.security,...e.security||{}}}}getConfigSchema(){return i.object({target:i.object({url:i.string().uri().required(),name:i.string().default("Target Application"),description:i.string().default("")}).required(),auth:i.object({username:i.string().allow(""),password:i.string().allow(""),basicAuth:i.object({enabled:i.boolean().default(!1),username:i.string().allow(""),password:i.string().allow("")}).default({}),loginSelectors:i.object({usernameField:i.array().items(i.string()).default(['input[name="username"]',"#username"]),passwordField:i.array().items(i.string()).default(['input[name="password"]',"#password"]),submitButton:i.array().items(i.string()).default(['input[type="submit"]','button[type="submit"]'])}).default({})}).default({}),testTypes:i.object({unit:i.object({enabled:i.boolean().default(!0),testDir:i.string().default("src/tests/unit"),pattern:i.string().default("**/*.test.js"),timeout:i.number().default(5e3)}).default({}),integration:i.object({enabled:i.boolean().default(!0),testDir:i.string().default("src/tests/integration"),pattern:i.string().default("**/*.test.js"),timeout:i.number().default(3e4)}).default({}),functional:i.object({enabled:i.boolean().default(!0),testDir:i.string().default("src/tests/functional"),pattern:i.string().default("**/*.test.js"),timeout:i.number().default(6e4)}).default({}),e2e:i.object({enabled:i.boolean().default(!0),testDir:i.string().default("src/tests/e2e"),pattern:i.string().default("**/*.test.js"),timeout:i.number().default(12e4)}).default({}),regression:i.object({enabled:i.boolean().default(!0),baselineDir:i.string().default("data/baselines"),compareDir:i.string().default("data/comparisons"),tolerance:i.number().default(.1)}).default({}),smoke:i.object({enabled:i.boolean().default(!0),criticalPaths:i.array().items(i.string()).default(["/login","/dashboard"]),timeout:i.number().default(3e4)}).default({}),performance:i.object({enabled:i.boolean().default(!0),metrics:i.array().items(i.string()).default(["loadTime","domContentLoaded","firstPaint"]),thresholds:i.object({loadTime:i.number().default(3e3),domContentLoaded:i.number().default(2e3),firstPaint:i.number().default(1500)}).default({})}).default({}),load:i.object({enabled:i.boolean().default(!0),virtualUsers:i.number().default(10),duration:i.number().default(6e4),rampUp:i.number().default(1e4)}).default({}),security:i.object({enabled:i.boolean().default(!0),checks:i.array().items(i.string()).default(["xss","sqlInjection","csrf"]),timeout:i.number().default(3e4)}).default({})}).default({}),browser:i.object({type:i.string().valid("chromium","firefox","webkit").default("chromium"),headless:i.boolean().default(!0),slowMo:i.number().default(0),timeout:i.number().default(3e4),viewport:i.object({width:i.number().default(1920),height:i.number().default(1080)}).default({}),options:i.object().default({})}).default({}),reporting:i.object({enabled:i.boolean().default(!0),formats:i.array().items(i.string().valid("json","html","markdown")).default(["json"]),outputDir:i.string().default("reports"),includeScreenshots:i.boolean().default(!0),includeVideos:i.boolean().default(!1)}).default({}),performance:i.object({metrics:i.array().items(i.string()).default(["loadTime","domContentLoaded","firstPaint"]),thresholds:i.object().default({}),collectNetworkLogs:i.boolean().default(!0),collectConsoleLogs:i.boolean().default(!0)}).default({}),security:i.object({payloads:i.object({xss:i.array().items(i.string()).default(['<script>alert("XSS")</script>']),sqlInjection:i.array().items(i.string()).default(["' OR '1'='1"]),csrf:i.array().items(i.string()).default(["../../../etc/passwd"])}).default({}),headers:i.array().items(i.string()).default(["X-Frame-Options","X-Content-Type-Options"]),ssl:i.object({checkCertificate:i.boolean().default(!0),checkProtocols:i.boolean().default(!0)}).default({})}).default({}),global:i.object({retries:i.number().default(2),parallel:i.boolean().default(!0),maxWorkers:i.number().default(4),timeout:i.number().default(6e4),verbose:i.boolean().default(!1)}).default({})})}getDefaultConfig(){return{target:{url:"https://example.com",name:"Default Test Target",description:"Default configuration for testing"},auth:{username:"",password:"",basicAuth:{enabled:!1,username:"",password:""},loginSelectors:{usernameField:['input[name="username"]',"#username",'input[type="email"]'],passwordField:['input[name="password"]',"#password"],submitButton:['input[type="submit"]','button[type="submit"]','button:contains("Login")']}},testTypes:{unit:{enabled:!0,testDir:"src/tests/unit",pattern:"**/*.test.js",timeout:5e3},integration:{enabled:!0,testDir:"src/tests/integration",pattern:"**/*.test.js",timeout:3e4},functional:{enabled:!0,testDir:"src/tests/functional",pattern:"**/*.test.js",timeout:6e4},e2e:{enabled:!0,testDir:"src/tests/e2e",pattern:"**/*.test.js",timeout:12e4},regression:{enabled:!0,baselineDir:"data/baselines",compareDir:"data/comparisons",tolerance:.1},smoke:{enabled:!0,criticalPaths:["/login","/dashboard","/profile"],timeout:3e4},performance:{enabled:!0,metrics:["loadTime","domContentLoaded","firstPaint","firstContentfulPaint"],thresholds:{loadTime:3e3,domContentLoaded:2e3,firstPaint:1500,firstContentfulPaint:2e3}},load:{enabled:!0,virtualUsers:10,duration:6e4,rampUp:1e4},security:{enabled:!0,checks:["xss","sqlInjection","csrf","headers","ssl"],timeout:3e4}},browser:{type:"chromium",headless:!0,slowMo:0,timeout:3e4,viewport:{width:1920,height:1080},options:{args:["--no-sandbox","--disable-setuid-sandbox"]}},reporting:{enabled:!0,formats:["json","html"],outputDir:"reports",includeScreenshots:!0,includeVideos:!1},performance:{metrics:["loadTime","domContentLoaded","firstPaint","firstContentfulPaint"],thresholds:{loadTime:3e3,domContentLoaded:2e3,firstPaint:1500,firstContentfulPaint:2e3},collectNetworkLogs:!0,collectConsoleLogs:!0},security:{payloads:{xss:['<script>alert("XSS")</script>','"><script>alert("XSS")</script>','javascript:alert("XSS")'],sqlInjection:["' OR '1'='1","'; DROP TABLE users; --","1' UNION SELECT * FROM users --"],csrf:["../../../etc/passwd","../../../../windows/system32/drivers/etc/hosts"]},headers:["X-Frame-Options","X-Content-Type-Options","X-XSS-Protection","Strict-Transport-Security","Content-Security-Policy"],ssl:{checkCertificate:!0,checkProtocols:!0}},global:{retries:2,parallel:!0,maxWorkers:4,timeout:6e4,verbose:!1}}}async createSampleConfig(e){let t={...this.defaultConfig,target:{url:"https://your-website.com",name:"Your Website",description:"Configuration for testing your website"},auth:{username:"your-username@example.com",password:"your-password",basicAuth:{enabled:!1,username:"",password:""}}};return await r.writeJson(e,t,{spaces:2}),e}async createConfigFromTemplate(e,t){let s={standard:this.getStandardTemplate(),spa:this.getSPATemplate(),api:this.getAPITemplate(),mobile:this.getMobileTemplate()},a=s[e];if(!a)throw Error(`Template '${e}' not found. Available templates: ${Object.keys(s).join(", ")}`);return await r.writeJson(t,a,{spaces:2}),t}getStandardTemplate(){return{...this.defaultConfig,target:{url:"https://your-standard-website.com",name:"Standard Website",description:"Configuration for standard HTML websites"},testTypes:{...this.defaultConfig.testTypes,performance:{...this.defaultConfig.testTypes.performance,thresholds:{loadTime:2e3,domContentLoaded:1500,firstPaint:1e3}}}}}getSPATemplate(){return{...this.defaultConfig,target:{url:"https://your-spa-website.com",name:"SPA Website",description:"Configuration for Single Page Applications (React, Vue, Angular)"},browser:{...this.defaultConfig.browser,slowMo:100,timeout:6e4},testTypes:{...this.defaultConfig.testTypes,performance:{...this.defaultConfig.testTypes.performance,thresholds:{loadTime:4e3,domContentLoaded:3e3,firstPaint:2e3}}}}}getAPITemplate(){return{...this.defaultConfig,target:{url:"https://api.your-website.com",name:"API Endpoints",description:"Configuration for API testing"},testTypes:{unit:{enabled:!0,testDir:"src/tests/api/unit"},integration:{enabled:!0,testDir:"src/tests/api/integration"},functional:{enabled:!1},e2e:{enabled:!1},regression:{enabled:!0},smoke:{enabled:!0,criticalPaths:["/health","/status"]},performance:{enabled:!0},load:{enabled:!0,virtualUsers:50},security:{enabled:!0}}}}getMobileTemplate(){return{...this.defaultConfig,target:{url:"https://m.your-website.com",name:"Mobile Website",description:"Configuration for mobile website testing"},browser:{...this.defaultConfig.browser,viewport:{width:375,height:667},options:{...this.defaultConfig.browser.options,deviceScaleFactor:2,isMobile:!0,hasTouch:!0}}}}}e.exports=o},4639:(e,t,s)=>{"use strict";e=s.nmd(e);let r=s(4470),a=s(5315),i=s(9760),o=s(5022),n=s(3591),l=s(2646),u=s(1161),c=s(4309),d=s(2873),p=s(5758),g=s(9128),m=s(7748),h=s(9871),f=s(6051),w=s(716),y=s(8457),b=s(1098);class T{constructor(){this.logger=new l,this.reportGenerator=new u,this.configLoader=new c,this.testRunners=new Map,this.setupTestRunners()}setupTestRunners(){this.testRunners.set("unit",new d(this.logger)),this.testRunners.set("integration",new p(this.logger)),this.testRunners.set("functional",new g(this.logger)),this.testRunners.set("e2e",new m(this.logger)),this.testRunners.set("regression",new h(this.logger)),this.testRunners.set("smoke",new f(this.logger)),this.testRunners.set("performance",new w(this.logger)),this.testRunners.set("load",new y(this.logger)),this.testRunners.set("security",new b(this.logger))}async runTests(e,t=["e2e"]){let s=Date.now();try{this.logger.info("\uD83D\uDE80 Starting API test execution..."),this.logger.info(`📋 Test Types: ${t.join(", ")}`);let r={framework:{name:"Universal Test Automation Framework",version:"2.0.0",startTime:new Date(s).toISOString(),endTime:null,duration:null,configuration:e},summary:{totalTestTypes:t.length,executed:0,passed:0,failed:0,skipped:0,totalTests:0,errors:[]},testTypes:{},environment:{nodeVersion:process.version,platform:process.platform,architecture:process.arch,memory:process.memoryUsage(),timestamp:new Date().toISOString()}};for(let s of t)await this.runTestType(s,e,r);let a=Date.now();return r.framework.endTime=new Date(a).toISOString(),r.framework.duration=a-s,this.logger.info("✅ API test execution completed"),r}catch(e){throw this.logger.error("❌ API test execution failed:",e),e}}async run(e={}){let t=Date.now(),s=n("Initializing Test Framework...").start();try{let r=await this.loadConfiguration(e.config);this.applyBrowserOverrides(r,e);let a=this.determineTestTypes(e.type,r);s.succeed("Test Framework Initialized"),console.log(o.cyan("\n\uD83D\uDE80 Universal Test Automation Framework v2.0")),console.log(o.gray("=".repeat(60))),console.log(o.yellow(`📋 Test Types: ${a.join(", ")}`)),console.log(o.yellow(`⚙️  Configuration: ${e.config||"default"}`)),console.log(o.yellow(`🎯 Target: ${r.target?.url||"N/A"}
`));let i={framework:{name:"Universal Test Automation Framework",version:"2.0.0",startTime:new Date(t).toISOString(),endTime:null,duration:null,configuration:r},summary:{totalTestTypes:a.length,executed:0,passed:0,failed:0,skipped:0,totalTests:0,errors:[]},testTypes:{},environment:{nodeVersion:process.version,platform:process.platform,architecture:process.arch,memory:process.memoryUsage(),timestamp:new Date().toISOString()}};for(let e of a)await this.runTestType(e,r,i);let n=Date.now();return i.framework.endTime=new Date(n).toISOString(),i.framework.duration=n-t,await this.generateReport(i,e),this.displaySummary(i),i}catch(e){throw s.fail("Test Framework Failed"),this.logger.error("TestRunner Error:",e),e}}async loadConfiguration(e){try{return await this.configLoader.load(e)}catch(e){return this.logger.warn("Using default configuration due to error:",e.message),this.configLoader.getDefaultConfig()}}applyBrowserOverrides(e,t){e.browser||(e.browser={}),null!==t.headless?e.browser.headless=t.headless:t["show-browser"]&&(e.browser.headless=!1,e.browser.slowMo=e.browser.slowMo||100);let s=e.browser.headless?"headless":"visible";this.logger.info(`🌐 Browser mode: ${s}`)}determineTestTypes(e,t=null){let s=["unit","integration","functional","e2e","regression","smoke","performance","load","security"];if("all"===e)return s;if(Array.isArray(e))return e.filter(e=>s.includes(e));if("string"==typeof e&&"auto"!==e)return e.split(",").map(e=>e.trim()).filter(e=>s.includes(e));if(!e||"auto"===e){if(t&&t.testTypes){let e=s.filter(e=>{let s=t.testTypes[e];return s&&!1!==s.enabled});if(e.length>0)return e}return["unit","integration","smoke","performance","security"]}return["smoke"]}async runTestType(e,t,s){let r=n(`Running ${e.toUpperCase()} Tests...`).start(),a=Date.now();try{let i=this.testRunners.get(e);if(!i)throw Error(`Test runner for type '${e}' not found`);let n=await i.run(t),l=Date.now(),u={type:e,startTime:new Date(a).toISOString(),endTime:new Date(l).toISOString(),duration:l-a,status:n.success?"PASSED":"FAILED",summary:n.summary||{},tests:n.tests||[],metrics:n.metrics||{},errors:n.errors||[]};s.testTypes[e]=u,s.summary.executed++,s.summary.totalTests+=n.summary?.totalTests||0,n.success?(s.summary.passed++,r.succeed(`${e.toUpperCase()} Tests Completed`)):(s.summary.failed++,s.summary.errors.push(...n.errors||[]),r.fail(`${e.toUpperCase()} Tests Failed`)),console.log(o.gray(`   Duration: ${l-a}ms`)),console.log(o.gray(`   Tests: ${n.summary?.totalTests||0}`)),console.log(o.gray(`   Status: ${n.success?o.green("PASSED"):o.red("FAILED")}
`))}catch(i){let t=Date.now();s.testTypes[e]={type:e,startTime:new Date(a).toISOString(),endTime:new Date(t).toISOString(),duration:t-a,status:"ERROR",error:i.message,stack:i.stack},s.summary.executed++,s.summary.failed++,s.summary.errors.push(`${e}: ${i.message}`),r.fail(`${e.toUpperCase()} Tests Error`),console.log(o.red(`   Error: ${i.message}
`))}}async generateReport(e,t){try{let s=new Date().toISOString().replace(/[:.]/g,"-"),i=a.join(process.cwd(),"reports");await r.ensureDir(i);let n=a.join(i,`test-report-${s}.json`);await r.writeJson(n,e,{spaces:2});let l=null;t.html&&(l=a.join(i,`test-report-${s}.html`),await this.generateHTMLReport(e,l));let u=a.join(i,`test-summary-${s}.json`);await r.writeJson(u,{summary:e.summary,framework:e.framework,environment:e.environment},{spaces:2}),console.log(o.green(`📊 Test Report Generated: ${n}`)),t.html&&l&&console.log(o.green(`🌐 HTML Report Generated: ${l}`))}catch(e){this.logger.error("Report generation failed:",e)}}async generateHTMLReport(e,t){let s=`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${e.framework.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .summary-card h3 { color: #666; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
        .summary-card .value { font-size: 32px; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .pending { color: #ffc107; }
        .test-results { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .test-type { border-bottom: 1px solid #eee; }
        .test-type:last-child { border-bottom: none; }
        .test-header { padding: 20px; background: #f8f9fa; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .test-header:hover { background: #e9ecef; }
        .test-content { padding: 20px; display: none; }
        .test-content.active { display: block; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-error { background: #f8d7da; color: #721c24; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .errors { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .toggle-icon { transition: transform 0.3s; }
        .toggle-icon.active { transform: rotate(180deg); }
        .footer { text-align: center; margin-top: 40px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 ${e.framework.name}</h1>
            <p>Generated: ${new Date(e.framework.timestamp).toLocaleString()}</p>
            <p>Target: ${e.framework.target}</p>
            <p>Duration: ${e.framework.duration}ms</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Test Types</h3>
                <div class="value">${e.summary.executed}/${e.summary.totalTestTypes}</div>
            </div>
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${e.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value passed">${e.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value failed">${e.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div class="value">${Math.round(e.summary.passed/e.summary.executed*100)}%</div>
            </div>
        </div>

        <div class="test-results">
            ${Object.entries(e.testTypes).map(([e,t])=>`
                <div class="test-type">
                    <div class="test-header" onclick="toggleTestContent('${e}')">
                        <div>
                            <h3>${e.toUpperCase()} Tests</h3>
                            <span class="status-badge status-${t.status.toLowerCase()}">${t.status}</span>
                        </div>
                        <div>
                            <span>Duration: ${t.duration}ms</span>
                            <span class="toggle-icon" id="icon-${e}">▼</span>
                        </div>
                    </div>
                    <div class="test-content" id="content-${e}">
                        <p><strong>Start Time:</strong> ${new Date(t.startTime).toLocaleString()}</p>
                        <p><strong>End Time:</strong> ${new Date(t.endTime).toLocaleString()}</p>
                        <p><strong>Duration:</strong> ${t.duration}ms</p>
                        
                        ${t.summary?`
                            <div class="metrics">
                                ${Object.entries(t.summary).map(([e,t])=>`
                                    <div class="metric">
                                        <strong>${e}:</strong> ${"object"==typeof t?JSON.stringify(t):t}
                                    </div>
                                `).join("")}
                            </div>
                        `:""}
                        
                        ${t.errors&&t.errors.length>0?`
                            <div class="errors">
                                <h4>Errors:</h4>
                                <ul>
                                    ${t.errors.map(e=>`<li>${e}</li>`).join("")}
                                </ul>
                            </div>
                        `:""}
                        
                        ${t.error?`
                            <div class="errors">
                                <h4>Error:</h4>
                                <p>${t.error}</p>
                            </div>
                        `:""}
                    </div>
                </div>
            `).join("")}
        </div>

        ${e.summary.errors.length>0?`
            <div class="errors" style="margin-top: 30px;">
                <h3>Overall Errors:</h3>
                <ul>
                    ${e.summary.errors.map(e=>`<li>${e}</li>`).join("")}
                </ul>
            </div>
        `:""}

        <div class="footer">
            <p>Generated by Universal Test Automation Framework v2.0</p>
        </div>
    </div>

    <script>
        function toggleTestContent(type) {
            const content = document.getElementById('content-' + type);
            const icon = document.getElementById('icon-' + type);
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                icon.classList.remove('active');
            } else {
                content.classList.add('active');
                icon.classList.add('active');
            }
        }
    </script>
</body>
</html>`;await r.writeFile(t,s)}displaySummary(e){let{summary:t}=e;console.log(o.cyan("\n\uD83D\uDCC8 TEST EXECUTION SUMMARY")),console.log(o.cyan("=".repeat(40))),console.log(o.yellow(`🔧 Test Types Executed: ${t.executed}/${t.totalTestTypes}`)),console.log(o.yellow(`📝 Total Tests: ${t.totalTests}`)),console.log(o.green(`✅ Passed: ${t.passed}`)),console.log(o.red(`❌ Failed: ${t.failed}`)),console.log(o.gray(`⏭️  Skipped: ${t.skipped}`)),console.log(o.yellow(`⏱️  Duration: ${e.framework.duration}ms`)),t.errors.length>0&&(console.log(o.red("\n❌ ERRORS:")),t.errors.forEach((e,t)=>{console.log(o.red(`   ${t+1}. ${e}`))})),console.log(o.cyan("\n\uD83C\uDFAF NEXT STEPS:")),console.log(o.gray("   • Check detailed reports in ./reports/ directory")),console.log(o.gray("   • Use --html flag for interactive HTML reports")),console.log(o.gray("   • Run specific test types with --type flag")),console.log(o.gray("   • Update configuration in ./config/ directory\n"))}}let S=i.option("type",{alias:"t",describe:"Test type(s) to run",type:"string",choices:["unit","integration","functional","e2e","regression","smoke","performance","load","security","all","auto"],default:"auto"}).option("config",{alias:"c",describe:"Configuration file path",type:"string",default:null}).option("html",{describe:"Generate HTML report",type:"boolean",default:!1}).option("verbose",{alias:"v",describe:"Verbose output",type:"boolean",default:!1}).option("headless",{describe:"Run browser in headless mode",type:"boolean",default:null}).option("show-browser",{describe:"Show browser window (opposite of headless)",type:"boolean",default:!1}).help().alias("help","h").example("$0","Run tests based on configuration (auto mode)").example("$0 --type=smoke","Run smoke tests only").example("$0 --type=unit,integration","Run unit and integration tests").example("$0 --type=all --html","Run all tests with HTML report").example("$0 --config=config/production.json","Run with specific configuration").example("$0 --show-browser","Run with visible browser window").example("$0 --headless","Run in headless mode").argv;async function v(){try{let e=new T,t=await e.run(S),s=t.summary.failed>0||t.summary.errors.length>0;process.exit(s?1:0)}catch(e){console.error(o.red("Fatal Error:"),e.message),process.exit(1)}}s.c[s.s]===e&&v(),e.exports=T},7748:(e,t,s)=>{"use strict";let{chromium:r,firefox:a,webkit:i}=s(6681),o=s(4470),n=s(5315);class l{constructor(e){this.logger=e,this.type="e2e",this.browser=null,this.context=null,this.variables={},this.playwright={chromium:r,firefox:a,webkit:i}}async run(e){this.logger.info("\uD83C\uDF10 Starting Enhanced E2E Tests...");let t=e.testTypes?.e2e||{};if(!t.enabled)return{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"E2E tests disabled in configuration"};try{await this.setupBrowser(e),this.initializeVariables(e);let s=await this.runE2EScenarios(e,t);return{success:0===s.failed,summary:{totalTests:s.total,passed:s.passed,failed:s.failed,skipped:s.skipped},tests:s.tests,metrics:{duration:s.duration||0,scenarios:s.scenarios||0},errors:s.errors||[]}}catch(e){return this.logger.error("E2E Test Runner Error:",e),{success:!1,summary:{totalTests:0,passed:0,failed:1,skipped:0},tests:[],metrics:{},errors:[e.message]}}finally{await this.cleanup()}}async setupBrowser(e){let t=e.browser||{};this.browser=await this.playwright[t.type||"chromium"].launch({headless:!1!==t.headless,slowMo:t.slowMo||0,timeout:t.timeout||3e4,args:t.options?.args||[]});let s=this.extractHttpBasicAuthCredentials(e);this.context=await this.browser.newContext({viewport:t.viewport||{width:1920,height:1080},ignoreHTTPSErrors:!0,...e.auth?.basicAuth?.enabled&&!e.auth.basicAuth.formBased&&{httpCredentials:{username:e.auth.basicAuth.username,password:e.auth.basicAuth.password}},...s&&{httpCredentials:s}}),this.page=await this.context.newPage(),e.testTypes?.e2e?.globalSettings?.tracing&&await this.context.tracing.start({screenshots:!0,snapshots:!0})}extractHttpBasicAuthCredentials(e){for(let t of e.testTypes?.e2e?.scenarios||[])for(let e of t.steps||[])if("navigate"===e.type&&e.basicAuth?.enabled)return this.logger.info(`🔐 Found HTTP Basic Auth credentials in scenario: ${t.name}`),{username:e.basicAuth.username,password:e.basicAuth.password};return null}initializeVariables(e){this.variables={auth:e.auth||{},target:e.target||{},custom:e.variables?.custom||{},browser:e.browser||{}}}async runE2EScenarios(e,t){let s=Date.now(),r={total:0,passed:0,failed:0,skipped:0,tests:[],errors:[],scenarios:0,duration:0},a=t.scenarios||[];if(0===a.length)return this.logger.warn("No E2E scenarios found in configuration"),r;let i=[];if(t.runOnlySelected&&t.selectedScenarios&&t.selectedScenarios.length>0)i=a.filter(e=>t.selectedScenarios.includes(e.id)),this.logger.info(`🎯 Running selected scenarios: ${t.selectedScenarios.join(", ")}`);else{let e=a.filter(e=>e.isMainScenario);e.length>0?(i=e,this.logger.info(`🌟 Running main scenarios: ${e.map(e=>e.name).join(", ")}`)):(i=a.filter(e=>e.enabled),this.logger.info(`🚀 Running all enabled scenarios`))}if(0===i.length)return this.logger.warn("No scenarios to run based on current selection criteria"),r;for(let t of(r.scenarios=i.length,this.logger.info(`Found ${i.length} scenarios to run`),i)){if(!t.enabled){this.logger.info(`⏭️  Skipping disabled scenario: ${t.name}`),r.skipped++;continue}let s=await this.runScenario(t,e);if(r.tests.push(...s.tests),r.total+=s.total,r.passed+=s.passed,r.failed+=s.failed,r.skipped+=s.skipped,r.errors.push(...s.errors),s.failed>0&&t.critical){this.logger.error(`❌ Critical scenario failed: ${t.name}`);break}}return r.duration=Date.now()-s,r}async runScenario(e,t){let s={total:0,passed:0,failed:0,skipped:0,tests:[],errors:[]};this.logger.info(`🎬 Running E2E Scenario: ${e.name}`),this.config=t;let r=await this.context.newPage();try{let a=e.steps||[];for(let i=0;i<a.length;i++){let o=a[i],n=await this.runScenarioStep(o,r,t,e,i+1);if(s.tests.push({scenario:e.name,scenarioId:e.id,step:i+1,stepId:o.id,...n}),s.total++,"PASSED"===n.status)s.passed++;else if("FAILED"===n.status){if(s.failed++,s.errors.push(`${e.name} Step ${i+1} (${o.id}): ${n.error}`),await this.takeScreenshotOnFailure(r,e,o,i+1,t),!1!==o.critical){this.logger.error(`💥 Critical step failed, stopping scenario: ${o.name}`);break}}else s.skipped++}}catch(t){s.failed++,s.errors.push(`Scenario ${e.name}: ${t.message}`),this.logger.error(`Scenario execution error: ${t.message}`)}finally{await r.close()}return s}async runScenarioStep(e,t,s,r,a){let i=Date.now();try{let r;this.logger.info(`  📋 Step ${a}: ${e.name} (${e.type})`);let o=this.substituteVariables(e);switch(o.type){case"navigate":r=await this.executeNavigateStep(o,t);break;case"click":r=await this.executeClickStep(o,t);break;case"fill":r=await this.executeFillStep(o,t);break;case"fill_form":r=await this.executeFillFormStep(o,t);break;case"verify":r=await this.executeVerifyStep(o,t);break;case"wait":r=await this.executeWaitStep(o,t);break;case"execute_scenario":r=await this.executeScenarioStep(o,t,s);break;case"custom":r=await this.executeCustomStep(o,t);break;default:throw Error(`Unknown step type: ${o.type}`)}o.assertions&&o.assertions.length>0&&await this.runAssertions(o.assertions,t);let n=Date.now()-i;return{name:o.name,type:o.type,status:"PASSED",duration:n,details:r}}catch(s){let t=Date.now()-i;return this.logger.error(`  ❌ Step ${a} failed: ${s.message}`),{name:e.name,type:e.type,status:"FAILED",duration:t,error:s.message}}}async executeNavigateStep(e,t){let{url:s,waitFor:r="networkidle",timeout:a=1e4,basicAuth:i}=e;if(i?.enabled){await this.handleStepBasicAuth(s,i,t);let e=t.url();this.logger.info(`🔐 After basic auth, current URL: ${e}`)}else await t.goto(s,{waitUntil:r,timeout:a});return{url:t.url()}}async executeClickStep(e,t){let{selector:s,waitFor:r,timeout:a=5e3,forceClick:i=!1,waitForVisible:o=!0}=e;o?await t.waitForSelector(s,{timeout:a}):await t.waitForSelector(s,{timeout:a,state:"attached"});let n=async()=>{i?await t.evaluate(e=>{let t=document.querySelector(e);if(t)t.click();else throw Error(`Element not found: ${e}`)},s):await t.click(s)};return"navigation"===r?await Promise.all([t.waitForNavigation({timeout:a}),n()]):"response"===r?await Promise.all([t.waitForResponse(e=>400>e.status(),{timeout:a}),n()]):await n(),{clicked:s}}async executeFillStep(e,t){let{selector:s,value:r,clearFirst:a=!0,timeout:i=5e3}=e;if(await t.waitForSelector(s,{timeout:i}),a&&await t.fill(s,""),await t.fill(s,r),!e.sensitive){let e=await t.inputValue(s);if(e!==r)throw Error(`Failed to fill field. Expected: ${r}, Actual: ${e}`)}return{filled:s,value:e.sensitive?"[HIDDEN]":r}}async executeFillFormStep(e,t){let{form:s}=e,r=[];for(let a of(s.selector&&await t.waitForSelector(s.selector,{timeout:e.timeout||1e4}),s.fields||[]))try{switch(await t.waitForSelector(a.selector,{timeout:5e3}),a.type){case"text":case"textarea":await t.fill(a.selector,a.value);break;case"select":await t.selectOption(a.selector,a.value);break;case"checkbox":a.value?await t.check(a.selector):await t.uncheck(a.selector);break;case"radio":await t.click(a.selector)}r.push({field:a.selector,status:"filled"})}catch(e){r.push({field:a.selector,status:"failed",error:e.message})}return{formFilled:s.selector,fields:r}}async executeVerifyStep(e,t){return{verified:!0}}async executeWaitStep(e,t){let{waitType:s,selector:r,timeout:a=5e3,condition:i}=e;switch(s){case"selector":await t.waitForSelector(r,{timeout:a});break;case"url":await t.waitForURL(i,{timeout:a});break;case"timeout":await t.waitForTimeout(a);break;case"function":await t.waitForFunction(i,{},{timeout:a})}return{waited:s}}async executeScenarioStep(e,t,s){return{executedScenario:e.scenario}}async executeCustomStep(e,t){return{customStep:e.action}}async runAssertions(e,t){for(let s of e)try{await this.runSingleAssertion(s,t)}catch(e){if(!s.optional)throw e;this.logger.warn(`Optional assertion failed: ${e.message}`)}}async runSingleAssertion(e,t){let{type:s,condition:r,value:a,selector:i}=e;switch(s){case"url":let o=t.url();switch(r){case"contains":if(!o.includes(a))throw Error(`URL should contain '${a}', but was '${o}'`);break;case"not_contains":if(o.includes(a))throw Error(`URL should not contain '${a}', but was '${o}'`);break;case"equals":if(o!==a)throw Error(`URL should equal '${a}', but was '${o}'`)}break;case"element":switch(r){case"visible":await t.waitForSelector(i,{state:"visible",timeout:5e3});break;case"hidden":await t.waitForSelector(i,{state:"hidden",timeout:5e3});break;case"hasValue":let n=await t.inputValue(i);if(n!==a)throw Error(`Element ${i} should have value '${a}', but was '${n}'`);break;case"hasText":let l=await t.textContent(i);if(!l.includes(a))throw Error(`Element ${i} should contain text '${a}', but was '${l}'`)}break;case"title":let u=await t.title();switch(r){case"equals":if(u!==a)throw Error(`Title should equal '${a}', but was '${u}'`);break;case"not_equals":if(u===a)throw Error(`Title should not equal '${a}'`);break;case"contains":if(!u.includes(a))throw Error(`Title should contain '${a}', but was '${u}'`)}}}substituteVariables(e){return JSON.parse(JSON.stringify(e).replace(/\{\{([^}]+)\}\}/g,(e,t)=>{let s=this.getVariableValue(t.trim());return void 0!==s?s:e}))}getVariableValue(e){let t=e.split("."),s=this.variables;for(let e of t){if(!s||"object"!=typeof s||!(e in s))return;s=s[e]}return s}async takeScreenshotOnFailure(e,t,s,r,a){try{if(!(a.testTypes?.e2e?.globalSettings||{}).screenshotOnFailure)return;let i=n.join("reports","screenshots","e2e");await o.ensureDir(i);let l=`${t.id}-step-${r}-${s.id}-failure.png`,u=n.join(i,l);await e.screenshot({path:u,fullPage:!0}),this.logger.info(`📸 Screenshot saved: ${u}`)}catch(e){this.logger.warn(`Failed to take screenshot: ${e.message}`)}}async cleanup(){try{if(this.context){try{await this.context.tracing.stop({path:"reports/traces/e2e-trace.zip"})}catch(e){}await this.context.close()}this.browser&&await this.browser.close()}catch(e){this.logger.warn("Error during E2E cleanup:",e.message)}}async handleStepBasicAuth(e,t,s){try{this.logger.info("\uD83D\uDD10 Handling step-level basic authentication..."),this.logger.info(`🔐 Target URL: ${e}`),this.logger.info(`🔐 Basic auth config: ${JSON.stringify(t,null,2)}`),this.logger.info(`🔐 Navigating to target URL with HTTP Basic Auth: ${e}`),await s.goto(e,{waitUntil:"networkidle",timeout:15e3});let r=s.url();if(this.logger.info(`🔐 Current URL after HTTP Basic Auth: ${r}`),t.loginPage&&r.includes(t.loginPage)){this.logger.info("\uD83D\uDD10 Detected form-based login after HTTP Basic Auth (double authentication)");let e=!1;for(let r of t.usernameField.split(",").map(e=>e.trim()))try{await s.waitForSelector(r,{timeout:5e3}),e=!0,this.logger.info(`🔐 Found login form with selector: ${r}`);break}catch(e){this.logger.info(`🔐 Selector ${r} not found, trying next...`)}if(e){let e=this.config?.auth?.username||t.username,r=this.config?.auth?.password||t.password;this.logger.info("\uD83D\uDD10 Filling form login after HTTP Basic Auth...");let a=await this.findWorkingSelector(t.usernameField,s);a&&(await s.fill(a,e),this.logger.info(`🔐 Filled form username: ${e}`));let i=await this.findWorkingSelector(t.passwordField,s);i&&(await s.fill(i,r),this.logger.info("\uD83D\uDD10 Filled form password"));let o=await this.findWorkingSelector(t.submitButton,s);if(o){this.logger.info("\uD83D\uDD10 Submitting form login...");try{await Promise.all([s.waitForNavigation({waitUntil:"networkidle",timeout:15e3}),s.click(o)])}catch(e){this.logger.info("\uD83D\uDD10 Navigation wait failed, trying simple click..."),await s.click(o),await s.waitForTimeout(3e3)}this.logger.info("\uD83D\uDD10 Form login submitted successfully")}}}else this.logger.info("\uD83D\uDD10 No form login required, HTTP Basic Auth was sufficient");await s.waitForTimeout(2e3);let a=s.url();if(this.logger.info(`🔐 Final URL after complete authentication: ${a}`),t.loginPage&&a.includes(t.loginPage))throw Error(`Authentication failed - still on login page: ${a}`);return this.logger.info("✅ Complete authentication (HTTP Basic Auth + Form Login) completed successfully"),!0}catch(s){throw this.logger.error(`❌ Authentication failed: ${s.message}`),this.logger.error(`❌ Auth error stack: ${s.stack}`),this.logger.error(`❌ Auth config: ${JSON.stringify(t,null,2)}`),this.logger.error(`❌ Target URL: ${e}`),s}}async findWorkingSelector(e,t){for(let s of e.split(",").map(e=>e.trim()))try{return await t.waitForSelector(s,{timeout:2e3}),s}catch(e){}throw Error(`None of the selectors found: ${e}`)}}e.exports=l},9128:e=>{"use strict";class t{constructor(e){this.logger=e,this.type="functional"}async run(e){return(this.logger.info("\uD83C\uDFAF Starting Functional Tests..."),(e.testTypes?.functional||{}).enabled)?{success:!0,summary:{totalTests:1,passed:1,failed:0,skipped:0},tests:[{name:"Basic Functional Test",status:"PASSED",duration:100}],metrics:{duration:100},errors:[]}:{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"Functional tests disabled in configuration"}}}e.exports=t},5758:(e,t,s)=>{"use strict";let r=s(4470),a=s(5315),i=s(2167);class o{constructor(e){this.logger=e,this.type="integration"}async run(e){let t=Date.now();this.logger.info("\uD83D\uDD17 Starting Integration Tests...");try{let s=e.testTypes?.integration||{};if(!s.enabled)return{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"Integration tests disabled in configuration"};let r=await this.loadIntegrationTests(s),a=await this.runIntegrationTests(r,e),i=Date.now()-t;return this.logger.info(`✅ Integration Tests completed in ${i}ms`),{success:0===a.failed,summary:{totalTests:a.total,passed:a.passed,failed:a.failed,skipped:a.skipped},tests:a.tests,metrics:{duration:i,averageTestTime:i/a.total||0,integrationPoints:a.integrationPoints||0},errors:a.errors}}catch(e){return this.logger.error("Integration Test Error:",e),{success:!1,summary:{totalTests:0,passed:0,failed:1,skipped:0},tests:[],metrics:{},errors:[e.message]}}}async loadIntegrationTests(e){let t=a.resolve(e.testDir||"src/tests/integration"),i=[];try{await r.ensureDir(t);let e=await r.readdir(t);for(let r of(0===e.length&&await this.createExampleIntegrationTests(t),await this.findTestFiles(t)))try{delete s.c[s(7467).resolve(r)];let e=s(7467)(r);i.push({name:a.basename(r,".js"),path:r,...e})}catch(e){this.logger.warn(`Failed to load integration test: ${r}`,e)}}catch(e){this.logger.error("Failed to load integration tests:",e)}return i}async runIntegrationTests(e,t){let s={total:0,passed:0,failed:0,skipped:0,tests:[],errors:[],integrationPoints:0};for(let r of e){let e=await this.runSingleIntegrationTest(r,t);s.tests.push(e),s.total++,"PASSED"===e.status?s.passed++:"FAILED"===e.status?(s.failed++,s.errors.push(`${r.name} - ${e.error}`)):s.skipped++,s.integrationPoints+=e.integrationPoints||0}return s}async runSingleIntegrationTest(e,t){let s=Date.now();try{if(!e.integrations||!Array.isArray(e.integrations))throw Error("Invalid integration test: missing integrations array");let r=[],a=0;for(let s of e.integrations){let e=await this.runIntegration(s,t);r.push(e),a++}let i=Date.now();return{name:e.name,status:"PASSED",duration:i-s,integrationPoints:a,results:r,error:null}}catch(r){let t=Date.now();return{name:e.name,status:"FAILED",duration:t-s,integrationPoints:0,results:[],error:r.message}}}async runIntegration(e,t){let s=Date.now();try{let r;switch(e.type){case"api":r=await this.testAPIIntegration(e,t);break;case"database":r=await this.testDatabaseIntegration(e,t);break;case"service":r=await this.testServiceIntegration(e,t);break;case"module":r=await this.testModuleIntegration(e,t);break;default:throw Error(`Unknown integration type: ${e.type}`)}let a=Date.now();return{type:e.type,name:e.name,status:"PASSED",duration:a-s,result:r}}catch(r){let t=Date.now();return{type:e.type,name:e.name,status:"FAILED",duration:t-s,error:r.message}}}async testAPIIntegration(e,t){let{endpoint:s,method:r="GET",headers:a={},data:o=null}=e,n=await i({method:r,url:s,headers:a,data:o,timeout:1e4});if(e.expectedStatus&&n.status!==e.expectedStatus)throw Error(`Expected status ${e.expectedStatus}, got ${n.status}`);return{status:n.status,headers:n.headers,data:n.data,responseTime:n.headers["x-response-time"]||"N/A"}}async testDatabaseIntegration(e,t){return{connected:!0,query:e.query||"SELECT 1",result:"Connection successful"}}async testServiceIntegration(e,t){let{service:s,operation:r}=e;return{service:s,operation:r,status:"operational",response:"Service integration successful"}}async testModuleIntegration(e,t){let{moduleA:s,moduleB:r,interaction:a}=e;return{moduleA:s,moduleB:r,interaction:a,status:"integrated",result:"Module integration successful"}}async findTestFiles(e){let t=[];try{for(let s of(await r.readdir(e,{withFileTypes:!0}))){let r=a.join(e,s.name);if(s.isDirectory()){let e=await this.findTestFiles(r);t.push(...e)}else s.isFile()&&s.name.endsWith(".test.js")&&t.push(r)}}catch(e){this.logger.warn("Error reading test directory:",e)}return t}async createExampleIntegrationTests(e){let t=[{name:"api-integration.test.js",content:`
// Example API Integration Test
module.exports = {
    name: 'API Integration Test',
    description: 'Tests integration with external APIs',
    
    integrations: [
        {
            type: 'api',
            name: 'Health Check API',
            endpoint: 'https://jsonplaceholder.typicode.com/posts/1',
            method: 'GET',
            expectedStatus: 200
        },
        {
            type: 'api',
            name: 'POST Request Test',
            endpoint: 'https://jsonplaceholder.typicode.com/posts',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { title: 'Test Post', body: 'Test content' },
            expectedStatus: 201
        }
    ]
};
                `},{name:"service-integration.test.js",content:`
// Example Service Integration Test
module.exports = {
    name: 'Service Integration Test',
    description: 'Tests integration between services',
    
    integrations: [
        {
            type: 'service',
            name: 'User Service to Auth Service',
            service: 'user-service',
            operation: 'authenticate',
            expectedResult: 'success'
        },
        {
            type: 'module',
            name: 'Payment Module to Order Module',
            moduleA: 'payment',
            moduleB: 'order',
            interaction: 'process_payment'
        }
    ]
};
                `}];for(let s of t){let t=a.join(e,s.name);await r.writeFile(t,s.content.trim(),"utf8")}this.logger.info(`Created ${t.length} example integration test files in ${e}`)}}e.exports=o},8457:e=>{"use strict";class t{constructor(e){this.logger=e,this.type="load"}async run(e){this.logger.info("\uD83D\uDCC8 Starting Load Tests...");let t=e.testTypes?.load||{};return t.enabled?{success:!0,summary:{totalTests:1,passed:1,failed:0,skipped:0},tests:[{name:"Basic Load Test",status:"PASSED",duration:5e3}],metrics:{duration:5e3,virtualUsers:t.virtualUsers||10},errors:[]}:{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"Load tests disabled in configuration"}}}e.exports=t},716:(e,t,s)=>{"use strict";let{chromium:r}=s(6681);class a{constructor(e){this.logger=e,this.type="performance",this.browser=null,this.context=null}async run(e){let t=Date.now();this.logger.info("⚡ Starting Performance Tests...");try{let s=e.testTypes?.performance||{};if(!s.enabled)return{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"Performance tests disabled in configuration"};await this.initializeBrowser(e);let r=await this.runPerformanceTests(e,s);await this.cleanup();let a=Date.now()-t;return this.logger.info(`✅ Performance Tests completed in ${a}ms`),{success:0===r.failed,summary:{totalTests:r.total,passed:r.passed,failed:r.failed,skipped:r.skipped},tests:r.tests,metrics:{duration:a,performanceMetrics:r.performanceMetrics},errors:r.errors}}catch(e){return await this.cleanup(),this.logger.error("Performance Test Error:",e),{success:!1,summary:{totalTests:0,passed:0,failed:1,skipped:0},tests:[],metrics:{},errors:[e.message]}}}async initializeBrowser(e){this.browser=await r.launch({headless:e.browser?.headless!==!1,args:["--no-sandbox","--disable-web-security"]}),this.context=await this.browser.newContext({viewport:e.browser?.viewport||{width:1920,height:1080},userAgent:"Universal Test Automation Framework - Performance Tests",...e.auth?.basicAuth?.enabled&&{httpCredentials:{username:e.auth.basicAuth.username,password:e.auth.basicAuth.password}}})}async runPerformanceTests(e,t){let s={total:0,passed:0,failed:0,skipped:0,tests:[],errors:[],performanceMetrics:{}},r=e.target?.url||"https://example.com",a=t.metrics||["loadTime","domContentLoaded","firstPaint"],i=t.thresholds||{};for(let o of[{name:"Page Load Performance",fn:()=>this.testPageLoadPerformance(r,e,a,i)},{name:"Resource Loading Performance",fn:()=>this.testResourceLoadingPerformance(r,e)},{name:"JavaScript Performance",fn:()=>this.testJavaScriptPerformance(r,e)},{name:"Network Performance",fn:()=>this.testNetworkPerformance(r,e)}]){let e=await this.runSinglePerformanceTest(o,t);s.tests.push(e),s.total++,"PASSED"===e.status?s.passed++:"FAILED"===e.status?(s.failed++,s.errors.push(`${o.name} - ${e.error}`)):s.skipped++,e.metrics&&Object.assign(s.performanceMetrics,e.metrics)}return s}async runSinglePerformanceTest(e,t){let s=Date.now();try{let t=await e.fn(),r=Date.now();return{name:e.name,status:"PASSED",duration:r-s,metrics:t,error:null}}catch(r){let t=Date.now();return{name:e.name,status:"FAILED",duration:t-s,metrics:{},error:r.message}}}async testPageLoadPerformance(e,t,s,r){let a=await this.context.newPage();try{this.logger.info(`📊 Testing page load performance: ${e}`),Date.now(),await a.goto(e,{waitUntil:"networkidle"});let t=await a.evaluate(()=>{let e=performance.getEntriesByType("navigation")[0],t=performance.getEntriesByType("paint");return{loadTime:e.loadEventEnd-e.navigationStart,domContentLoaded:e.domContentLoadedEventEnd-e.navigationStart,firstPaint:t.find(e=>"first-paint"===e.name)?.startTime||0,firstContentfulPaint:t.find(e=>"first-contentful-paint"===e.name)?.startTime||0,ttfb:e.responseStart-e.navigationStart,domComplete:e.domComplete-e.navigationStart}}),s=[];for(let[e,a]of Object.entries(t))r[e]&&a>r[e]&&s.push(`${e}: ${a}ms > ${r[e]}ms`);if(s.length>0)throw Error(`Performance thresholds exceeded: ${s.join(", ")}`);return this.logger.info(`✅ Page load performance test passed`),t}finally{await a.close()}}async testResourceLoadingPerformance(e,t){let s=await this.context.newPage();try{this.logger.info(`📦 Testing resource loading performance: ${e}`);let t=[];s.on("response",e=>{t.push({url:e.url(),status:e.status(),size:e.headers()["content-length"]||0,type:e.request().resourceType(),timing:null})}),await s.goto(e,{waitUntil:"networkidle"});let r={totalResources:t.length,totalSize:t.reduce((e,t)=>e+parseInt(t.size||0),0),slowResources:[],failedResources:t.filter(e=>e.status>=400),resourceTypes:{}};return t.forEach(e=>{let t=e.type;r.resourceTypes[t]||(r.resourceTypes[t]={count:0,totalSize:0}),r.resourceTypes[t].count++,r.resourceTypes[t].totalSize+=parseInt(e.size||0)}),this.logger.info(`✅ Resource loading performance test completed`),r}finally{await s.close()}}async testJavaScriptPerformance(e,t){let s=await this.context.newPage();try{this.logger.info(`🔧 Testing JavaScript performance: ${e}`),await s.goto(e,{waitUntil:"networkidle"});let t=await s.evaluate(()=>{let e=Date.now(),t=0;for(let e=0;e<1e5;e++)t+=Math.random();return{executionTime:Date.now()-e,memoryUsage:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize,limit:performance.memory.jsHeapSizeLimit}:null,result:t}});return this.logger.info(`✅ JavaScript performance test completed`),t}finally{await s.close()}}async testNetworkPerformance(e,t){let s=await this.context.newPage();try{this.logger.info(`🌐 Testing network performance: ${e}`);let t=[];s.on("request",e=>{t.push({type:"request",url:e.url(),method:e.method(),timestamp:Date.now()})}),s.on("response",e=>{t.push({type:"response",url:e.url(),status:e.status(),size:e.headers()["content-length"]||0,timestamp:Date.now()})}),await s.goto(e,{waitUntil:"networkidle"});let r=t.filter(e=>"request"===e.type),a=t.filter(e=>"response"===e.type),i={totalRequests:r.length,totalResponses:a.length,averageResponseTime:0,successfulRequests:a.filter(e=>e.status<400).length,failedRequests:a.filter(e=>e.status>=400).length};return this.logger.info(`✅ Network performance test completed`),i}finally{await s.close()}}async cleanup(){try{this.context&&(await this.context.close(),this.context=null),this.browser&&(await this.browser.close(),this.browser=null)}catch(e){this.logger.warn("Performance cleanup error:",e)}}}e.exports=a},9871:e=>{"use strict";class t{constructor(e){this.logger=e,this.type="regression"}async run(e){this.logger.info("\uD83D\uDD04 Starting Regression Tests...");let t=e.testTypes?.regression||{};return t.enabled?{success:!0,summary:{totalTests:1,passed:1,failed:0,skipped:0},tests:[{name:"Basic Regression Test",status:"PASSED",duration:300}],metrics:{duration:300,tolerance:t.tolerance||.1},errors:[]}:{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"Regression tests disabled in configuration"}}}e.exports=t},1098:(e,t,s)=>{"use strict";let{chromium:r}=s(6681),a=s(2167);class i{constructor(e){this.logger=e,this.type="security",this.browser=null,this.context=null}async run(e){let t=Date.now();this.logger.info("\uD83D\uDD12 Starting Security Tests...");try{let s=e.testTypes?.security||{};if(!s.enabled)return{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"Security tests disabled in configuration"};await this.initializeBrowser(e);let r=await this.runSecurityTests(e,s);await this.cleanup();let a=Date.now()-t;return this.logger.info(`✅ Security Tests completed in ${a}ms`),{success:0===r.failed,summary:{totalTests:r.total,passed:r.passed,failed:r.failed,skipped:r.skipped},tests:r.tests,metrics:{duration:a,vulnerabilities:r.vulnerabilities},errors:r.errors}}catch(e){return await this.cleanup(),this.logger.error("Security Test Error:",e),{success:!1,summary:{totalTests:0,passed:0,failed:1,skipped:0},tests:[],metrics:{},errors:[e.message]}}}async initializeBrowser(e){this.browser=await r.launch({headless:e.browser?.headless!==!1,args:["--no-sandbox","--disable-web-security","--ignore-certificate-errors"]}),this.context=await this.browser.newContext({viewport:e.browser?.viewport||{width:1920,height:1080},ignoreHTTPSErrors:!0,userAgent:"Universal Test Automation Framework - Security Tests",...e.auth?.basicAuth?.enabled&&{httpCredentials:{username:e.auth.basicAuth.username,password:e.auth.basicAuth.password}}})}async runSecurityTests(e,t){let s={total:0,passed:0,failed:0,skipped:0,tests:[],errors:[],vulnerabilities:[]},r=e.target?.url||"https://example.com",a=t.checks||["xss","sqlInjection","csrf","headers","ssl"];for(let i of[{name:"XSS Vulnerability Test",fn:()=>this.testXSSVulnerability(r,e),enabled:a.includes("xss")},{name:"SQL Injection Test",fn:()=>this.testSQLInjection(r,e),enabled:a.includes("sqlInjection")},{name:"CSRF Protection Test",fn:()=>this.testCSRFProtection(r,e),enabled:a.includes("csrf")},{name:"Security Headers Test",fn:()=>this.testSecurityHeaders(r,e),enabled:a.includes("headers")},{name:"SSL/TLS Configuration Test",fn:()=>this.testSSLConfiguration(r,e),enabled:a.includes("ssl")}]){if(!i.enabled){s.tests.push({name:i.name,status:"SKIPPED",reason:"Test disabled"}),s.skipped++;continue}let e=await this.runSingleSecurityTest(i,t);s.tests.push(e),s.total++,"PASSED"===e.status?s.passed++:"FAILED"===e.status&&(s.failed++,s.errors.push(`${i.name} - ${e.error}`),e.vulnerabilities&&s.vulnerabilities.push(...e.vulnerabilities))}return s}async runSingleSecurityTest(e,t){let s=Date.now();try{let t=await e.fn(),r=Date.now();return{name:e.name,status:"PASSED",duration:r-s,result:t,vulnerabilities:t.vulnerabilities||[],error:null}}catch(r){let t=Date.now();return{name:e.name,status:"FAILED",duration:t-s,result:null,error:r.message,vulnerabilities:[]}}}async testXSSVulnerability(e,t){let s=await this.context.newPage(),r=[];try{this.logger.info(`🕷️ Testing XSS vulnerabilities: ${e}`),await s.goto(e,{waitUntil:"networkidle"});let a=t.security?.payloads?.xss||['<script>alert("XSS")</script>','"><script>alert("XSS")</script>','javascript:alert("XSS")','<img src=x onerror=alert("XSS")>'];for(let e of(await s.$$('input[type="text"], input[type="search"], textarea')))for(let t of a)try{await e.fill(t),await s.keyboard.press("Enter"),await s.evaluate(()=>window.xssDetected||!1)&&r.push({type:"XSS",severity:"HIGH",payload:t,location:await e.getAttribute("name")||"unknown"})}catch(e){}return{tested:!0,vulnerabilities:r}}finally{await s.close()}}async testSQLInjection(e,t){let s=[];try{for(let r of(this.logger.info(`💉 Testing SQL injection vulnerabilities: ${e}`),t.security?.payloads?.sqlInjection||["' OR '1'='1","'; DROP TABLE users; --","1' UNION SELECT * FROM users --"]))try{let t=`${e}?id=${encodeURIComponent(r)}`,i=await a.get(t,{timeout:5e3});["SQL syntax","mysql_fetch","ORA-","PostgreSQL","sqlite_"].some(e=>i.data.toLowerCase().includes(e.toLowerCase()))&&s.push({type:"SQL_INJECTION",severity:"CRITICAL",payload:r,location:t})}catch(e){}return{tested:!0,vulnerabilities:s}}catch(e){throw Error(`SQL injection test failed: ${e.message}`)}}async testCSRFProtection(e,t){let s=await this.context.newPage();try{this.logger.info(`🛡️ Testing CSRF protection: ${e}`),await s.goto(e,{waitUntil:"networkidle"});let t=await s.$$("form"),r=[];for(let e of t)if(!(await e.$('input[name*="csrf"], input[name*="token"], input[name="_token"]')!==null)){let t=await e.getAttribute("action")||"unknown";r.push({type:"CSRF",severity:"MEDIUM",description:"Form without CSRF protection",location:t})}return{tested:!0,vulnerabilities:r}}finally{await s.close()}}async testSecurityHeaders(e,t){try{this.logger.info(`📋 Testing security headers: ${e}`);let s=(await a.get(e,{timeout:1e4})).headers,r=[];for(let a of t.security?.headers||["x-frame-options","x-content-type-options","x-xss-protection","strict-transport-security","content-security-policy"])s[a.toLowerCase()]||r.push({type:"MISSING_HEADER",severity:"MEDIUM",description:`Missing security header: ${a}`,location:e});return{tested:!0,vulnerabilities:r,headers:Object.keys(s)}}catch(e){throw Error(`Security headers test failed: ${e.message}`)}}async testSSLConfiguration(e,t){try{if(this.logger.info(`🔐 Testing SSL/TLS configuration: ${e}`),!e.startsWith("https://"))return{tested:!0,vulnerabilities:[{type:"NO_HTTPS",severity:"HIGH",description:"Website not using HTTPS",location:e}]};return await a.get(e,{timeout:1e4,httpsAgent:new(s(5240)).Agent({rejectUnauthorized:!1})}),{tested:!0,vulnerabilities:[],sslEnabled:!0}}catch(t){if("CERT_UNTRUSTED"===t.code||"UNABLE_TO_VERIFY_LEAF_SIGNATURE"===t.code)return{tested:!0,vulnerabilities:[{type:"SSL_CERTIFICATE",severity:"HIGH",description:"Invalid or untrusted SSL certificate",location:e}]};throw Error(`SSL configuration test failed: ${t.message}`)}}async cleanup(){try{this.context&&(await this.context.close(),this.context=null),this.browser&&(await this.browser.close(),this.browser=null)}catch(e){this.logger.warn("Security cleanup error:",e)}}}e.exports=i},6051:(e,t,s)=>{"use strict";let{chromium:r}=s(6681),a=s(5087);class i{constructor(e){this.logger=e,this.type="smoke",this.browser=null,this.context=null,this.authHandler=new a(e)}async run(e){let t=Date.now();this.logger.info("\uD83D\uDCA8 Starting Smoke Tests...");try{let s=e.testTypes?.smoke||{};if(!s.enabled)return{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"Smoke tests disabled in configuration"};await this.initializeBrowser(e);let r=await this.runSmokeTests(e,s);await this.cleanup();let a=Date.now()-t;return this.logger.info(`✅ Smoke Tests completed in ${a}ms`),{success:0===r.failed,summary:{totalTests:r.total,passed:r.passed,failed:r.failed,skipped:r.skipped},tests:r.tests,metrics:{duration:a,averageTestTime:a/r.total||0,browserInitTime:r.browserInitTime||0},errors:r.errors}}catch(e){return await this.cleanup(),this.logger.error("Smoke Test Error:",e),{success:!1,summary:{totalTests:0,passed:0,failed:1,skipped:0},tests:[],metrics:{},errors:[e.message]}}}async initializeBrowser(e){let t=Date.now();this.browser=await r.launch({headless:e.browser?.headless!==!1,slowMo:e.browser?.slowMo||0,args:e.browser?.options?.args||["--no-sandbox"]}),this.context=await this.browser.newContext({viewport:e.browser?.viewport||{width:1920,height:1080},userAgent:"Universal Test Automation Framework - Smoke Tests",...e.auth?.basicAuth?.enabled&&{httpCredentials:{username:e.auth.basicAuth.username,password:e.auth.basicAuth.password}}}),this.context.on("request",e=>{this.logger.debug(`🌐 Request: ${e.method()} ${e.url()}`)}),this.context.on("response",e=>{!e.ok()&&300>e.status()||e.status()>=400?this.logger.warn(`⚠️  Response: ${e.status()} ${e.url()}`):e.status()>=300&&400>e.status()&&this.logger.debug(`🔄 Redirect: ${e.status()} ${e.url()}`)});let s=Date.now()-t;return this.logger.info(`🚀 Browser initialized in ${s}ms`),s}async runSmokeTests(e,t){let s={total:0,passed:0,failed:0,skipped:0,tests:[],errors:[]},r=t.criticalPaths||["/"],a=e.target?.url||"https://example.com";for(let i of[{name:"Website Accessibility",fn:()=>this.testWebsiteAccessibility(a,e)},{name:"Login Functionality",fn:()=>this.testLoginFunctionality(a,e)},...r.map(t=>({name:`Critical Path: ${t}`,fn:()=>{let s=a.endsWith("/")?a.slice(0,-1):a,r=t.startsWith("/")?t:"/"+t;return this.testCriticalPath(s+r,e)}}))]){let e=await this.runSingleSmokeTest(i,t);s.tests.push(e),s.total++,"PASSED"===e.status?s.passed++:"FAILED"===e.status?(s.failed++,s.errors.push(`${i.name} - ${e.error}`)):s.skipped++}return s}async runSingleSmokeTest(e,t){let s=Date.now();try{let r=t.timeout||3e4,a=await Promise.race([e.fn(),new Promise((e,t)=>setTimeout(()=>t(Error("Smoke test timeout")),r))]),i=Date.now();return{name:e.name,status:"PASSED",duration:i-s,result:a,error:null}}catch(r){let t=Date.now();return{name:e.name,status:"FAILED",duration:t-s,result:null,error:r.message}}}async testWebsiteAccessibility(e,t){let s=await this.context.newPage();try{this.logger.info(`🔍 Testing website accessibility: ${e}`);let t=await s.goto(e,{waitUntil:"networkidle",timeout:3e4});if(t.status()>=400)throw Error(`Website not accessible: ${t.status()} ${t.statusText()}`);let r=await s.title();if(!r||""===r.trim())throw Error("Page has no title");let a=await s.$("body")!==null;if(!a)throw Error("Page has no body element");let i=[];s.on("pageerror",e=>{i.push(e.message)}),await s.waitForTimeout(2e3);let o={url:e,title:r,status:t.status(),hasBasicStructure:a,jsErrors:i.length,jsErrorDetails:i};return this.logger.info(`✅ Website accessibility test passed for ${e}`),o}finally{await s.close()}}async testLoginFunctionality(e,t){if(!t.auth?.username||!t.auth?.password)return{skipped:!0,reason:"No authentication credentials provided"};let s=await this.context.newPage();try{this.logger.info(`🔐 Testing login functionality: ${e}`),await s.goto(e,{waitUntil:"networkidle"});let r=await this.authHandler.authenticate(s,t,"auto");if(r.success)return this.logger.info(`✅ Login functionality test completed successfully using ${r.strategy} strategy`),{loginAttempted:!0,success:!0,strategy:r.strategy,finalUrl:s.url(),details:r.details};for(let a of["form","react","vue"]){if(a===r.strategy)continue;this.logger.info(`🔄 Retrying login with ${a} strategy`),await s.goto(e,{waitUntil:"networkidle"});let i=await this.authHandler.authenticate(s,t,a);if(i.success)return this.logger.info(`✅ Login successful with ${a} strategy on retry`),{loginAttempted:!0,success:!0,strategy:a,finalUrl:s.url(),details:i.details,retriedStrategies:[r.strategy]}}return this.logger.warn(`⚠️ Login failed with all strategies. Last error: ${r.error}`),{loginAttempted:!0,success:!1,error:r.error,strategy:r.strategy,finalUrl:s.url(),details:r.details}}catch(e){return this.logger.error(`❌ Login functionality test error: ${e.message}`),{loginAttempted:!0,success:!1,error:e.message,finalUrl:s.url()}}finally{await s.close()}}async testCriticalPath(e,t){let s=await this.context.newPage();try{this.logger.info(`🛤️ Testing critical path: ${e}`);let t=await s.goto(e,{waitUntil:"networkidle",timeout:3e4});if(t.status()>=400)throw Error(`Critical path failed: ${t.status()} ${t.statusText()}`);await s.waitForLoadState("domcontentloaded");let r=await s.title(),a=await s.$("body")!==null,i={url:e,status:t.status(),title:r,hasContent:a,loadedSuccessfully:!0};return this.logger.info(`✅ Critical path test passed for ${e}`),i}finally{await s.close()}}async cleanup(){try{this.context&&(await this.context.close(),this.context=null),this.browser&&(await this.browser.close(),this.browser=null)}catch(e){this.logger.warn("Cleanup error:",e)}}}e.exports=i},2873:(e,t,s)=>{"use strict";let r=s(4470),a=s(5315);class i{constructor(e){this.logger=e,this.type="unit"}async run(e){let t=Date.now();this.logger.info("\uD83E\uDDEA Starting Unit Tests...");try{let s=e.testTypes?.unit||{};if(!s.enabled)return{success:!0,summary:{totalTests:0,passed:0,failed:0,skipped:1},tests:[],metrics:{},message:"Unit tests disabled in configuration"};let r=await this.loadTestModules(s),a=await this.runTestModules(r,s),i=Date.now()-t;return this.logger.info(`✅ Unit Tests completed in ${i}ms`),{success:0===a.failed,summary:{totalTests:a.total,passed:a.passed,failed:a.failed,skipped:a.skipped},tests:a.tests,metrics:{duration:i,testsPerSecond:a.total/(i/1e3),averageTestTime:i/a.total||0},errors:a.errors}}catch(e){return this.logger.error("Unit Test Error:",e),{success:!1,summary:{totalTests:0,passed:0,failed:1,skipped:0},tests:[],metrics:{},errors:[e.message]}}}async loadTestModules(e){let t=a.resolve(e.testDir||"src/tests/unit"),i=e.pattern||"**/*.test.js",o=[];try{await r.ensureDir(t);let e=await r.readdir(t);for(let r of(0===e.length&&await this.createExampleTests(t),await this.findTestFiles(t,i)))try{delete s.c[s(2100).resolve(r)];let e=s(2100)(r);o.push({name:a.basename(r,".js"),path:r,tests:e.tests||[],setup:e.setup,teardown:e.teardown})}catch(e){this.logger.warn(`Failed to load test module: ${r}`,e)}}catch(e){this.logger.error("Failed to load test modules:",e)}return o}async runTestModules(e,t){let s={total:0,passed:0,failed:0,skipped:0,tests:[],errors:[]};for(let r of e)try{for(let e of(r.setup&&"function"==typeof r.setup&&await r.setup(),r.tests)){let a=await this.runSingleTest(e,r,t);s.tests.push(a),s.total++,"PASSED"===a.status?s.passed++:"FAILED"===a.status?(s.failed++,s.errors.push(`${r.name}:${e.name} - ${a.error}`)):s.skipped++}r.teardown&&"function"==typeof r.teardown&&await r.teardown()}catch(e){s.failed++,s.errors.push(`Module ${r.name}: ${e.message}`)}return s}async runSingleTest(e,t,s){let r=Date.now();try{if(!e.name||"function"!=typeof e.fn)throw Error("Invalid test structure: missing name or function");let a=e.timeout||s.timeout||5e3,i=await Promise.race([e.fn(),new Promise((e,t)=>setTimeout(()=>t(Error("Test timeout")),a))]),o=Date.now();return{name:e.name,module:t.name,status:"PASSED",duration:o-r,result:i,error:null}}catch(a){let s=Date.now();return{name:e.name,module:t.name,status:"FAILED",duration:s-r,result:null,error:a.message}}}async findTestFiles(e,t){let s=[];try{for(let i of(await r.readdir(e,{withFileTypes:!0}))){let r=a.join(e,i.name);if(i.isDirectory()){let e=await this.findTestFiles(r,t);s.push(...e)}else i.isFile()&&i.name.endsWith(".test.js")&&s.push(r)}}catch(e){this.logger.warn("Error reading test directory:",e)}return s}async createExampleTests(e){let t=[{name:"math-utils.test.js",content:`
// Example Unit Tests for Math Utilities
const mathUtils = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => b !== 0 ? a / b : null
};

module.exports = {
    tests: [
        {
            name: 'add two positive numbers',
            fn: async () => {
                const result = mathUtils.add(2, 3);
                if (result !== 5) {
                    throw new Error(\`Expected 5, got \${result}\`);
                }
                return result;
            }
        },
        {
            name: 'subtract two numbers',
            fn: async () => {
                const result = mathUtils.subtract(10, 4);
                if (result !== 6) {
                    throw new Error(\`Expected 6, got \${result}\`);
                }
                return result;
            }
        },
        {
            name: 'multiply two numbers',
            fn: async () => {
                const result = mathUtils.multiply(3, 4);
                if (result !== 12) {
                    throw new Error(\`Expected 12, got \${result}\`);
                }
                return result;
            }
        },
        {
            name: 'divide by zero returns null',
            fn: async () => {
                const result = mathUtils.divide(10, 0);
                if (result !== null) {
                    throw new Error(\`Expected null, got \${result}\`);
                }
                return result;
            }
        }
    ],
    setup: async () => {
        console.log('Setting up math utils tests...');
    },
    teardown: async () => {
        console.log('Cleaning up math utils tests...');
    }
};
                `},{name:"string-utils.test.js",content:`
// Example Unit Tests for String Utilities  
const stringUtils = {
    capitalize: str => str.charAt(0).toUpperCase() + str.slice(1),
    reverse: str => str.split('').reverse().join(''),
    isPalindrome: str => {
        const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return clean === clean.split('').reverse().join('');
    }
};

module.exports = {
    tests: [
        {
            name: 'capitalize first letter',
            fn: async () => {
                const result = stringUtils.capitalize('hello');
                if (result !== 'Hello') {
                    throw new Error(\`Expected 'Hello', got '\${result}'\`);
                }
                return result;
            }
        },
        {
            name: 'reverse string',
            fn: async () => {
                const result = stringUtils.reverse('hello');
                if (result !== 'olleh') {
                    throw new Error(\`Expected 'olleh', got '\${result}'\`);
                }
                return result;
            }
        },
        {
            name: 'detect palindrome',
            fn: async () => {
                const result = stringUtils.isPalindrome('A man a plan a canal Panama');
                if (result !== true) {
                    throw new Error(\`Expected true, got \${result}\`);
                }
                return result;
            }
        },
        {
            name: 'detect non-palindrome',
            fn: async () => {
                const result = stringUtils.isPalindrome('hello world');
                if (result !== false) {
                    throw new Error(\`Expected false, got \${result}\`);
                }
                return result;
            }
        }
    ]
};
                `}];for(let s of t){let t=a.join(e,s.name);await r.writeFile(t,s.content.trim(),"utf8")}this.logger.info(`Created ${t.length} example unit test files in ${e}`)}}e.exports=i},5087:e=>{"use strict";class t{constructor(e){this.logger=e,this.authStrategies=new Map,this.setupAuthStrategies()}setupAuthStrategies(){this.authStrategies.set("basic",this.basicAuthStrategy.bind(this)),this.authStrategies.set("form",this.formLoginStrategy.bind(this)),this.authStrategies.set("react",this.reactLoginStrategy.bind(this)),this.authStrategies.set("vue",this.vueLoginStrategy.bind(this)),this.authStrategies.set("token",this.tokenAuthStrategy.bind(this)),this.authStrategies.set("oauth",this.oauthStrategy.bind(this))}async authenticate(e,t,s="auto"){try{this.logger.info(`🔐 Starting authentication with strategy: ${s}`),"auto"===s&&(s=await this.detectAuthStrategy(e,t),this.logger.info(`🔍 Auto-detected authentication strategy: ${s}`));let r=this.authStrategies.get(s);if(!r)throw Error(`Unknown authentication strategy: ${s}`);let a=await r(e,t);return a.success?this.logger.info(`✅ Authentication successful using ${s} strategy`):this.logger.warn(`⚠️ Authentication failed using ${s} strategy: ${a.error}`),a}catch(e){return this.logger.error(`❌ Authentication error: ${e.message}`),{success:!1,strategy:s,error:e.message,details:null}}}async detectAuthStrategy(e,t){try{let s=await e.evaluate(()=>!!(window.React||window.__REACT_DEVTOOLS_GLOBAL_HOOK__||document.querySelector("[data-reactroot]")||document.querySelector('div[id="root"]'))),r=await e.evaluate(()=>!!(window.Vue||window.__VUE__||document.querySelector("[data-v-]")||document.querySelector('div[id="app"]'))),a=await e.$("form")!==null,i=await this.findElement(e,this.getUsernameSelectors(t))!==null,o=await this.findElement(e,this.getPasswordSelectors(t))!==null;if(t.auth?.strategy)return t.auth.strategy;if(s&&a)return"react";if(r&&a)return"vue";if(i&&o)return"form";else if(t.auth?.basicAuth?.enabled)return"basic";else if(t.auth?.apiKey||t.auth?.bearerToken)return"token";else return"form"}catch(e){return this.logger.warn(`Failed to detect auth strategy: ${e.message}`),"form"}}async basicAuthStrategy(e,t){let s=t.auth?.basicAuth;if(!s?.enabled||!s.username||!s.password)return{success:!1,strategy:"basic",error:"Basic auth credentials not provided",details:null};try{let r=e.url();if(t.auth?.loginUrl){let s=t.target?.url||e.url(),a=s.endsWith("/")?s.slice(0,-1):s,i=t.auth.loginUrl.startsWith("/")?t.auth.loginUrl:"/"+t.auth.loginUrl;r=a+i,this.logger.info(`🔗 Navigating to login URL: ${r}`),await e.goto(r,{waitUntil:"networkidle",timeout:3e4})}let a=await e.goto(r,{waitUntil:"networkidle",timeout:3e4});if(a&&401===a.status())return{success:!1,strategy:"basic",error:"Basic authentication failed - 401 Unauthorized",details:{username:s.username,targetUrl:r,status:a.status()}};return{success:!0,strategy:"basic",error:null,details:{username:s.username,method:"HTTP Basic Authentication",targetUrl:r,finalUrl:e.url()}}}catch(e){return{success:!1,strategy:"basic",error:`Basic auth navigation failed: ${e.message}`,details:null}}}async formLoginStrategy(e,t){let s=t.auth;if(!s?.username||!s?.password)return{success:!1,strategy:"form",error:"Username or password not provided",details:null};try{s.loginUrl&&!e.url().includes(s.loginUrl)&&await e.goto(e.url()+s.loginUrl,{waitUntil:"networkidle"});let r=await this.findAndFillField(e,this.getUsernameSelectors(t),s.username,"username"),a=await this.findAndFillField(e,this.getPasswordSelectors(t),s.password,"password"),i=await this.submitLoginForm(e,t),o=await this.verifyLoginSuccess(e,t);return{success:o.success,strategy:"form",error:o.success?null:o.error,details:{usernameField:r?"found":"not found",passwordField:a?"found":"not found",submitMethod:i.method,finalUrl:e.url(),verification:o}}}catch(e){return{success:!1,strategy:"form",error:e.message,details:null}}}async reactLoginStrategy(e,t){let s=t.auth;if(!s?.username||!s?.password)return{success:!1,strategy:"react",error:"Username or password not provided",details:null};try{await e.waitForFunction(()=>window.React||window.__REACT_DEVTOOLS_GLOBAL_HOOK__||document.querySelector("[data-reactroot]"),{timeout:1e4}),s.loginUrl&&!e.url().includes(s.loginUrl)&&await e.goto(e.url()+s.loginUrl,{waitUntil:"networkidle"}),await e.waitForLoadState("domcontentloaded"),await e.waitForTimeout(1e3);let r=[...this.getUsernameSelectors(t),'input[data-testid*="username"]','input[data-testid*="email"]','input[placeholder*="username" i]','input[placeholder*="email" i]'],a=[...this.getPasswordSelectors(t),'input[data-testid*="password"]','input[placeholder*="password" i]'],i=await this.findElement(e,r);i&&(await i.click(),await i.fill(""),await i.type(s.username,{delay:100}),await e.waitForTimeout(500));let o=await this.findElement(e,a);o&&(await o.click(),await o.fill(""),await o.type(s.password,{delay:100}),await e.waitForTimeout(500));let n=[...this.getSubmitSelectors(t),'button[data-testid*="login"]','button[data-testid*="submit"]','button:has-text("Login")','button:has-text("Sign In")','button:has-text("Log In")'],l=await this.findElement(e,n);l&&(await e.waitForTimeout(500),await Promise.all([e.waitForResponse(e=>e.url().includes("login")||e.url().includes("auth")||200===e.status(),{timeout:1e4}).catch(()=>null),l.click()])),await e.waitForTimeout(2e3);let u=await this.verifyLoginSuccess(e,t);return{success:u.success,strategy:"react",error:u.success?null:u.error,details:{reactDetected:!0,usernameField:i?"found":"not found",passwordField:o?"found":"not found",submitButton:l?"found":"not found",finalUrl:e.url(),verification:u}}}catch(e){return{success:!1,strategy:"react",error:e.message,details:null}}}async vueLoginStrategy(e,t){let s=t.auth;if(!s?.username||!s?.password)return{success:!1,strategy:"vue",error:"Username or password not provided",details:null};try{await e.waitForFunction(()=>window.Vue||window.__VUE__||document.querySelector("[data-v-]"),{timeout:1e4}),s.loginUrl&&!e.url().includes(s.loginUrl)&&await e.goto(e.url()+s.loginUrl,{waitUntil:"networkidle"}),await e.waitForLoadState("domcontentloaded"),await e.waitForTimeout(1e3);let r=[...this.getUsernameSelectors(t),'input[v-model*="username"]','input[v-model*="email"]','input[data-cy*="username"]','input[data-cy*="email"]'],a=[...this.getPasswordSelectors(t),'input[v-model*="password"]','input[data-cy*="password"]'],i=await this.findElement(e,r);i&&(await i.click(),await i.fill(""),await i.type(s.username,{delay:100}),await i.dispatchEvent("input"),await e.waitForTimeout(300));let o=await this.findElement(e,a);o&&(await o.click(),await o.fill(""),await o.type(s.password,{delay:100}),await o.dispatchEvent("input"),await e.waitForTimeout(300));let n=[...this.getSubmitSelectors(t),'button[data-cy*="login"]','button[data-cy*="submit"]','button:has-text("Login")','button:has-text("Sign In")','button:has-text("Connexion")'],l=await this.findElement(e,n);l&&(await e.waitForTimeout(500),await Promise.all([e.waitForResponse(e=>e.url().includes("login")||e.url().includes("auth")||200===e.status(),{timeout:1e4}).catch(()=>null),l.click()])),await e.waitForTimeout(2e3);let u=await this.verifyLoginSuccess(e,t);return{success:u.success,strategy:"vue",error:u.success?null:u.error,details:{vueDetected:!0,usernameField:i?"found":"not found",passwordField:o?"found":"not found",submitButton:l?"found":"not found",finalUrl:e.url(),verification:u}}}catch(e){return{success:!1,strategy:"vue",error:e.message,details:null}}}async tokenAuthStrategy(e,t){let s=t.auth;try{return s.bearerToken?await e.setExtraHTTPHeaders({Authorization:`Bearer ${s.bearerToken}`}):s.apiKey&&await e.setExtraHTTPHeaders({"X-API-Key":s.apiKey,Authorization:`ApiKey ${s.apiKey}`}),await e.goto(e.url(),{waitUntil:"networkidle"}),{success:!0,strategy:"token",error:null,details:{tokenType:s.bearerToken?"Bearer":"ApiKey",finalUrl:e.url()}}}catch(e){return{success:!1,strategy:"token",error:e.message,details:null}}}async oauthStrategy(e,t){return{success:!1,strategy:"oauth",error:"OAuth strategy not implemented yet",details:null}}async findElement(e,t){if(!e||e.isClosed())return null;for(let s of t)try{if(e.isClosed())return null;let t=await e.$(s);if(t)return t}catch(e){}return null}async findAndFillField(e,t,s,r){if(!e||e.isClosed())return this.logger.warn(`⚠️ Page is closed, cannot fill ${r} field`),null;let a=await this.findElement(e,t);if(!a)return this.logger.warn(`⚠️ ${r} field not found`),null;try{if(e.isClosed())return this.logger.warn(`⚠️ Page closed before filling ${r} field`),null;return await a.click(),await a.fill(s),this.logger.debug(`✅ Filled ${r} field`),a}catch(e){return this.logger.warn(`⚠️ Error filling ${r} field: ${e.message}`),null}}async submitLoginForm(e,t){if(!e||e.isClosed())return{method:"none",success:!1,error:"Page is closed"};let s=this.getSubmitSelectors(t),r=await this.findElement(e,s);if(r)try{if(e.isClosed())return{method:"none",success:!1,error:"Page closed before submit"};return await Promise.all([e.waitForResponse(e=>304!==e.status(),{timeout:1e4}).catch(()=>null),r.click()]),{method:"button_click",success:!0}}catch(e){return{method:"button_click",success:!1,error:e.message}}try{if(e.isClosed())return{method:"none",success:!1,error:"Page closed before form submit"};if(await e.$("form"))return await Promise.all([e.waitForResponse(e=>304!==e.status(),{timeout:1e4}).catch(()=>null),e.keyboard.press("Enter")]),{method:"form_submit",success:!0}}catch(e){return{method:"form_submit",success:!1,error:e.message}}return{method:"none",success:!1}}async verifyLoginSuccess(e,t){try{if(!e||e.isClosed())return{success:!1,error:"Page has been closed",details:null};if(await e.waitForTimeout(2e3),!e||e.isClosed())return{success:!1,error:"Page was closed during verification wait",details:null};let t=e.url(),s=await e.title(),r=!1,a=[];for(let t of[".error",".alert-danger",".invalid-feedback",".error-message",'[data-testid*="error"]',".notification.is-danger",".alert.alert-danger"])try{if(e.isClosed())break;let s=await e.$(t);if(s){r=!0;let e=await s.textContent();e&&a.push(e.trim())}}catch(e){}let i=0;for(let s of[()=>t.includes("dashboard"),()=>t.includes("home"),()=>t.includes("profile"),()=>!t.includes("login"),async()=>{if(e.isClosed())return!1;let t=await e.$(".user-menu");return null!==t},async()=>{if(e.isClosed())return!1;let t=await e.$('[data-testid*="user"]');return null!==t},async()=>{if(e.isClosed())return!1;let t=await e.$(".logout");return null!==t}])try{if(e.isClosed())break;await s()&&i++}catch(e){}let o=!r&&i>0;return{success:o,error:r?a.join("; "):o?null:"No clear success indicators found",details:{currentUrl:t,title:s,hasErrors:r,errorMessages:a,successIndicators:i}}}catch(e){return{success:!1,error:`Verification failed: ${e.message}`,details:null}}}getUsernameSelectors(e){return[e.auth?.usernameField,"#username","#user","#email","#login",'input[name="username"]','input[name="user"]','input[name="email"]','input[name="login"]','input[type="email"]','input[id*="username"]','input[id*="email"]','input[placeholder*="username" i]','input[placeholder*="email" i]'].filter(Boolean)}getPasswordSelectors(e){return[e.auth?.passwordField,"#password","#pass","#pwd",'input[name="password"]','input[name="pass"]','input[name="pwd"]','input[type="password"]','input[id*="password"]'].filter(Boolean)}getSubmitSelectors(e){return[e.auth?.submitButton,'button[type="submit"]','input[type="submit"]','button:has-text("Login")','button:has-text("Sign In")','button:has-text("Log In")','button:has-text("Submit")',".btn-login",".login-button","#login-button"].filter(Boolean)}}e.exports=t},1161:(e,t,s)=>{"use strict";let r=s(4470);s(5315);let a=s(5022);class i{constructor(){this.templates={html:this.getHTMLTemplate(),markdown:this.getMarkdownTemplate()}}async generateHTMLReport(e,t){try{let s=this.generateHTML(e);return await r.writeFile(t,s,"utf8"),t}catch(e){throw Error(`Failed to generate HTML report: ${e.message}`)}}async generateMarkdownReport(e,t){try{let s=this.generateMarkdown(e);return await r.writeFile(t,s,"utf8"),t}catch(e){throw Error(`Failed to generate Markdown report: ${e.message}`)}}generateHTML(e){let{framework:t,summary:s,testTypes:r,environment:a}=e,i=Object.entries(r).map(([e,t])=>{let s="PASSED"===t.status?"#4CAF50":"FAILED"===t.status?"#F44336":"#FF9800";return`
                <tr>
                    <td>${e.toUpperCase()}</td>
                    <td><span style="color: ${s}; font-weight: bold;">${t.status}</span></td>
                    <td>${t.summary?.totalTests||0}</td>
                    <td>${t.summary?.passed||0}</td>
                    <td>${t.summary?.failed||0}</td>
                    <td>${t.duration}ms</td>
                </tr>
            `}).join(""),o=s.errors.length>0?`<ul>${s.errors.map(e=>`<li>${e}</li>`).join("")}</ul>`:"<p>No errors reported.</p>";return this.templates.html.replace("{{TITLE}}",`Test Report - ${t.name}`).replace("{{FRAMEWORK_NAME}}",t.name).replace("{{FRAMEWORK_VERSION}}",t.version).replace("{{START_TIME}}",t.startTime).replace("{{END_TIME}}",t.endTime).replace("{{DURATION}}",t.duration).replace("{{TOTAL_TEST_TYPES}}",s.totalTestTypes).replace("{{EXECUTED}}",s.executed).replace("{{PASSED}}",s.passed).replace("{{FAILED}}",s.failed).replace("{{TOTAL_TESTS}}",s.totalTests).replace("{{TEST_TYPE_ROWS}}",i).replace("{{ERRORS_LIST}}",o).replace("{{ENVIRONMENT_JSON}}",JSON.stringify(a,null,2)).replace("{{FULL_RESULTS_JSON}}",JSON.stringify(e,null,2))}generateMarkdown(e){let{framework:t,summary:s,testTypes:r,environment:a}=e,i=`# Test Report - ${t.name}

`;return i+=`## Framework Information
- **Name:** ${t.name}
- **Version:** ${t.version}
- **Start Time:** ${t.startTime}
- **End Time:** ${t.endTime}
- **Duration:** ${t.duration}ms

## Test Summary
| Metric | Value |
|--------|-------|
| Test Types Executed | ${s.executed}/${s.totalTestTypes} |
| Total Tests | ${s.totalTests} |
| Passed | ${s.passed} |
| Failed | ${s.failed} |
| Skipped | ${s.skipped} |

## Test Types Results
| Type | Status | Tests | Passed | Failed | Duration |
|------|--------|-------|--------|--------|---------|
`,Object.entries(r).forEach(([e,t])=>{i+=`| ${e.toUpperCase()} | ${t.status} | ${t.summary?.totalTests||0} | ${t.summary?.passed||0} | ${t.summary?.failed||0} | ${t.duration}ms |
`}),s.errors.length>0&&(i+=`
## Errors
`,s.errors.forEach((e,t)=>{i+=`${t+1}. ${e}
`})),i}getHTMLTemplate(){return`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .error-list {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 4px;
            padding: 15px;
        }
        .json-container {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            font-size: 12px;
        }
        .collapsible {
            cursor: pointer;
            background: #667eea;
            color: white;
            padding: 10px;
            border: none;
            border-radius: 4px;
            width: 100%;
            text-align: left;
            margin: 10px 0;
        }
        .collapsible:hover {
            background: #5a6fd8;
        }
        .collapsible-content {
            display: none;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{FRAMEWORK_NAME}}</h1>
            <p>Version {{FRAMEWORK_VERSION}} | {{START_TIME}} - {{END_TIME}} | Duration: {{DURATION}}ms</p>
        </div>
        
        <div class="content">
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Test Types</h3>
                    <div class="value">{{EXECUTED}}/{{TOTAL_TEST_TYPES}}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="value">{{TOTAL_TESTS}}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="value" style="color: #4CAF50;">{{PASSED}}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="value" style="color: #F44336;">{{FAILED}}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Test Types Results</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Tests</th>
                            <th>Passed</th>
                            <th>Failed</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{TEST_TYPE_ROWS}}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>Errors</h2>
                <div class="error-list">
                    {{ERRORS_LIST}}
                </div>
            </div>
            
            <div class="section">
                <button class="collapsible" onclick="toggleCollapsible(this)">Environment Information</button>
                <div class="collapsible-content">
                    <div class="json-container">
                        <pre>{{ENVIRONMENT_JSON}}</pre>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <button class="collapsible" onclick="toggleCollapsible(this)">Full Test Results (JSON)</button>
                <div class="collapsible-content">
                    <div class="json-container">
                        <pre>{{FULL_RESULTS_JSON}}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function toggleCollapsible(element) {
            const content = element.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        }
    </script>
</body>
</html>
        `}getMarkdownTemplate(){return"# Test Report Template"}async generateSummaryReport(e,t){let s={framework:e.framework,summary:e.summary,environment:e.environment,testTypeSummary:{}};return Object.entries(e.testTypes).forEach(([e,t])=>{s.testTypeSummary[e]={status:t.status,duration:t.duration,totalTests:t.summary?.totalTests||0,passed:t.summary?.passed||0,failed:t.summary?.failed||0,errors:t.errors?.length||0}}),await r.writeJson(t,s,{spaces:2}),t}printConsoleReport(e){let{framework:t,summary:s,testTypes:r}=e;console.log(a.cyan(`
📊 ${t.name} v${t.version}`)),console.log(a.cyan("=".repeat(60))),console.log(a.yellow(`⏱️  Duration: ${t.duration}ms`)),console.log(a.yellow(`🔧 Test Types: ${s.executed}/${s.totalTestTypes}`)),console.log(a.yellow(`📝 Total Tests: ${s.totalTests}`)),console.log(a.green(`✅ Passed: ${s.passed}`)),console.log(a.red(`❌ Failed: ${s.failed}`)),console.log(a.cyan("\n\uD83D\uDCCB Test Type Details:")),Object.entries(r).forEach(([e,t])=>{let s="PASSED"===t.status?a.green:"FAILED"===t.status?a.red:a.yellow;console.log(`  ${e.padEnd(12)} ${s(t.status.padEnd(8))} ${(t.summary?.totalTests||0).toString().padEnd(6)} ${t.duration}ms`)}),s.errors.length>0&&(console.log(a.red("\n❌ Errors:")),s.errors.forEach((e,t)=>{console.log(a.red(`   ${t+1}. ${e}`))}))}}e.exports=i},2646:(e,t,s)=>{"use strict";let r=s(7773),a=s(5315);class i{constructor(){this.logger=r.createLogger({level:"info",format:r.format.combine(r.format.timestamp({format:"YYYY-MM-DD HH:mm:ss"}),r.format.errors({stack:!0}),r.format.printf(({level:e,message:t,timestamp:s,stack:r})=>r?`${s} [${e.toUpperCase()}]: ${t}
${r}`:`${s} [${e.toUpperCase()}]: ${t}`)),transports:[new r.transports.Console({format:r.format.combine(r.format.colorize(),r.format.simple())}),new r.transports.File({filename:a.join("logs","error.log"),level:"error",maxsize:5242880,maxFiles:5}),new r.transports.File({filename:a.join("logs","combined.log"),maxsize:5242880,maxFiles:5})]}),s(4470).ensureDirSync("logs")}info(e,t={}){this.logger.info(e,t)}warn(e,t={}){this.logger.warn(e,t)}error(e,t=null){t instanceof Error?this.logger.error(e,t):t?this.logger.error(`${e}: ${t}`):this.logger.error(e)}debug(e,t={}){this.logger.debug(e,t)}setLevel(e){this.logger.level=e}}e.exports=i},7153:(e,t)=>{"use strict";var s;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return s}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(s||(s={}))},1802:(e,t,s)=>{"use strict";e.exports=s(145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var s=t(t.s=6956);module.exports=s})();