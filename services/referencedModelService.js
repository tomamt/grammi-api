/* eslint-disable no-loop-func */
/* eslint-disable no-plusplus */
const ModelService = require('../services/modelService');

class ReferencedModelService extends ModelService {
  constructor(model, references) {
    super(model);
    this.references = references;
  }

  // List all records along with reference details
  async getAll(obj) {
    let refResultObject = '';
    const query = obj.query || {};
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const resultObject = this.Model.find(query);
    this.references.forEach((element) => {
      refResultObject = resultObject.populate(element);
    });
    const result = await refResultObject.skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return result;
  }

  // Get particular record along with reference  details
  async getById(Id) {
    let refResultObject = '';
    const resultObject = this.Model.findById({ _id: Id });
    this.references.forEach((element) => {
      refResultObject = resultObject.populate(element);
    });
    return refResultObject;
  }

  // updating array without replacing
  async updateMenuItemsWithOutReplace(updateObj) {
    const menuList = updateObj.data;
    const menuListTemp = menuList;
    let refResultObject = '';

    const resultObject = await this.Model.findById({ _id: updateObj.Id });
    const menuExistingItems = resultObject.menuItems;
    // const lenthObj = menuList.length;
    let i;

    for (i = 0; i < menuListTemp.length; i++) {
      const idx = menuExistingItems.findIndex((x) => x.menuItemId === menuListTemp[i].menuItemId);
      if (idx !== -1) {
        // const temp = i;
        menuList.splice(i, 1);
        i--;
      }
    }

    refResultObject = this.Model.update(
      { _id: updateObj.Id },
      { $push: { menuItems: menuList } }, { upsert: true },
    );

    return refResultObject;
  }

  // delete array without replacing
  async deleteMenuItemsWithOutReplace(updateObj) {
    const menuObj = updateObj.data;
    let refResultObject = '';
    menuObj.forEach((element) => {
      refResultObject = this.Model.update(
        { _id: updateObj.Id },
        { $pull: { menuItems: { menuItemId: element.menuItemId } } }, { upsert: true },
      );
    });
    return refResultObject;
  }
}
module.exports = ReferencedModelService;
