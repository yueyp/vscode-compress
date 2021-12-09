# usmart-vscode-compress README

支持压缩`png`，`jpg`，`jpeg`格式的图片。

支持将`png`，`jpg`，`jpeg`格式的图片转换为`webp`格式的图片。

本插件采用的是`tinypng`提供的`API`进行的图片压缩，所以插件安装完成后需要去[tinypng官网](https://tinypng.com/developers)获取自己的`API key`。

获取到自己的`API key`之后，需要打开vscode编辑器的配置文件，新增如下配置：

```
"tinypng.apiKey":"********************",
"tinypng.forceOverwrite": false,
"compress.webpQuality": 70
```
`tinypng.apiKey`：即我们原本在官网下获取到的`API key`。该配置项为必须项，不配置则无法进行图片压缩。每人每月前500张免费，超过则需到官网购买。

`tinypng.forceOverwrite`：选择压缩后的图片是放置在新的目录下还是直接替换该图片。`true`：直接替换；`false`：放置在新目录下。不配置时默认为`false`。

`compress.webpQuality`：转换为`webp`的质量配置，范围为0-100，配置越高，图片越清晰，同样体积越大。不配置时默认为50。
## commands

### `compressImage`
选中图片时，点击鼠标右键，选择菜单中`compressImage`命令即可压缩图片，图片压缩完成后默认放置在被压缩图片所在文件夹下的`image-min`目录。

### `compressImageFolder`
选中文件夹时，点击鼠标右键，选择菜单中`compressImageFolder`命令即可压缩该文件夹下的图片，图片压缩完成后默认放置在该文件夹下的`image-min`目录。

### `convertToWebp`
选中图片时，点击鼠标右键，选择菜单中`convertToWebp`命令即可将该图片转换为webp格式的，图片转换完成后放置在被转换图片所在文件夹下的`webp`目录。

### `convertFolderToWebp`
选中文件夹时，点击鼠标右键，选择菜单中`convertFolderToWebp`命令即可将该文件夹下的图片转换为webp格式的，图片转换完成后放置在该文件夹下的`webp`目录。

### `getCompressUsedCount`
由于`tinypng`官网每月仅提供了500张图片压缩免费，超出不购买的话就会压缩失败，该命令可以查询每月已经压缩了多少张图片。命令栏中输入该命令，编辑器右下角即会展示压缩了多少张图片。
