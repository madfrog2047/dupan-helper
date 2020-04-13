import getContext from '../baidu/getContext';
import LocalStore from '../utils/LocalStore';
import StandardCodeDialog from './StandardCodeDialog';
import { loadAsync } from '../my-loader';
import getDialog from '../baidu/getDialog';

import './ImportCheckbox.css';
import Checkbox from '../components/Checkbox';

export default class ImportOnLoad {
  static create(content) {
    return new ImportOnLoad(content);
  }

  constructor(content = '') {
    this.content = content;

    this.onConfirm = this.onConfirm.bind(this);

    this.initTreeSelector().catch(console.error);
  }

  async initTreeSelector() {
    // 百度的这个依赖没处理好啊，还得我手动照着顺序来加载
    await loadAsync('disk-system:widget/system/baseService/shareDir/shareDirManager.js');
    this.fileTreeDialog = await loadAsync('disk-system:widget/system/uiService/fileTreeDialog/fileTreeDialog.js');

    this.ui = getContext().ui;
    this.directoryStore = LocalStore.create(this, 'import_dir');
    this.prevPath = this.directoryStore.value || '/';

    this.selectDirectory();
  }

  selectDirectory() {
    this.dirSelectDialog = this.fileTreeDialog.show({
      title: '导入至…',
      confirm: this.onConfirm,
      isZip: true,
      showShareDir: false,
      path: '/',
    });

    this.$dialogBody = this.dirSelectDialog.dialog.$dialog.find(getDialog().QUERY.dialogBody);
    this.checkUsePrevPath = new Checkbox('使用上次储存的位置', 'jx-prev-path');
    this.checkUsePrevPath.appendTo(this.$dialogBody);
    this.$prevPath = $('<code>').text(this.prevPath);
    this.checkUsePrevPath.$text.append(this.$prevPath);
    this.checkUsePrevPath.root.prop('title', this.prevPath);
  }

  onConfirm(targetDir) {
    this.fileTreeDialog.hide();

    const { content } = this;
    const directory = this.checkUsePrevPath.checked ? this.prevPath : targetDir;
    this.directoryStore.value = directory;
    StandardCodeDialog.create({ directory, content });
  }
}