const fs = require('fs-extra');
const path = require('path');

/*
*
* 处理配置文件
* 生成配置文件: pages.json、manifest.json
*
*/
async function configHandle(configData, routerData, miniprogramRoot, targetFolder) {
	try {
		await new Promise((resolve, reject) => {
			////////////////////////////write pages.json/////////////////////////////

			//app.json文件路径
			let json_app = path.join(miniprogramRoot, "app.json");
			let appJson = fs.readJsonSync(json_app);

			//将pages节点里的数据，提取routerData对应的标题，写入到pages节点里
			let pages = [];
			for (const key in appJson.pages) {
				let pagePath = appJson.pages[key];
				let rkey = path.join(targetFolder, pagePath);
				let data = routerData[rkey];

				let navigationBarTitleText = "";
				let usingComponents = {};

				if(data && JSON.stringify(data) != "{}")
				{
					navigationBarTitleText = data.navigationBarTitleText;
					usingComponents = data.usingComponents;
				}

				let obj = {
					"path": pagePath,
					"style": {
						"navigationBarTitleText": navigationBarTitleText,
						"usingComponents":usingComponents
					}
				};
				pages.push(obj);
			}
			appJson.pages = pages;

			//替换window节点为globalStyle
			appJson["globalStyle"] = appJson["window"];
			delete appJson["window"];

			//sitemap.json似乎在uniapp用不上，删除！
			delete appJson["sitemapLocation"];

			//usingComponents节点，也是用不上。 //先保留着
			// delete data["usingComponents"];

			//tabBar节点一致，不做调整

			//写入pages.json
			let file_pages = path.join(targetFolder, "pages.json");
			fs.writeFile(file_pages, JSON.stringify(appJson, null, '\t'), () => {
				console.log(`write ${file_pages} success!`);
			});

			////////////////////////////write manifest.json/////////////////////////////

			//注：因json里不能含有注释，因些template/manifest.json文件里的注释已经被删除。
			let file_manifest = path.join(__dirname, "/template/manifest.json");
			let manifestJson = fs.readJsonSync(file_manifest);
			//
			manifestJson.name = configData.name;
			manifestJson.description = configData.description;
			manifestJson.versionName = configData.version;
			manifestJson["mp-weixin"].appid = configData.appid;

			//manifest.json
			file_manifest = path.join(targetFolder, "manifest.json");
			fs.writeFile(file_manifest, JSON.stringify(manifestJson, null, '\t'), () => {
				console.log(`write ${file_manifest} success!`);
			});


			////////////////////////////write main.js/////////////////////////////
			let file_main_temp = path.join(__dirname, "/template/main.js");
			let file_main = path.join(targetFolder, "main.js");
			fs.copySync(file_main_temp, file_main);


			//////////////////////////////////////////////////////////////////////
			resolve();
		});
	} catch (err) {
		console.log(err);
	}
}

module.exports = configHandle;
