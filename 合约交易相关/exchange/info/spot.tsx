'use client';
import { symbolList } from '@/service/common';
import {
  spotCreate,
  spotDetail,
  spotUpdate,
} from '@/service/operations/contract';
import { useStore } from '@/store/store';
import { regexpForDecimal, regexpForPercentage } from '@/utils/util';
import {
  DrawerForm,
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  CONTRACT_TYPE_OPTIONS,
  LIMIT_SOURCE_OPTIONS,
  ORDER_TYPE_OPTIONS,
  TIME_IN_FORCE_OPTIONS,
  TRADING_PAIR_TRADING_STATUS,
  TYPE_SPOT,
} from '../constant';

import { ISpotFormItem, ISpotParams } from '../type';

const ORDER_TYPE_OPTIONS_FOR_SPOT = ORDER_TYPE_OPTIONS.filter(
  (item) => item.value !== 'REDUCE_ONLY'
);
interface IProps {
  visible: boolean;
  setVisible: (p: boolean) => void;
  symbolId?: number;
  reload: () => void;
  businessType: string;
  headerTitle: string;
}
const CreateForm: React.FC<IProps> = ({
  visible,
  setVisible,
  symbolId,
  reload,
  businessType = TYPE_SPOT,
  headerTitle = '现货',
}) => {
  const [form] = Form.useForm();
  const [formParams, setFormParams] = useState<ISpotParams>({
    symbolInfo: {
      symbol: '',
      businessType: '',
      baseCurrency: '',
      quoteCurrency: '',
      tickSize: 0,
      quantityPrecision: 0,
      pricePrecision: 0,
      rankWeight: 0,
      onlinePrice: 0,
    },
    orderParam: {
      orderAmtLimit: 0,
      mergeDepth: '',
      timeInForce: '',
      orderType: '',
      limitSingleOrderBalMaxLimit: 0,
      marketSingleOrderBalMaxLimit: 0,
      singleOrderBalMinLimit: 0,
      singleOrderAmtMinLimit: 0,
    },
    orderLimit: {
      limitOrderMaxRate: 0,
      limitOrderMinRate: 0,
      marketOrderMaxRate: 0,
      marketOrderMinRate: 0,
      openLever: 0,
    },
    permissionTrade: '',
  });

  const [modifyMap, setModifyMap] = useState(new Map());
  const [pricePrecision, setPricePrecision] = useState(0);
  const {
    userInfoStore: { userInfo },
  } = useStore();

  const isNumToPercentageProp = ({
    // 要除以100的数字字段，传递给后端
    prop,
    propList = [
      'limitOrderMaxRate',
      'limitOrderMinRate',
      'marketOrderMaxRate',
      'marketOrderMinRate',
    ],
  }: {
    prop: string;
    propList?: (string | number)[];
  }) => {
    return propList.includes(prop);
  };

  const onFieldChange = ({
    field,
    fieldProp,
    value,
  }: {
    field: string;
    fieldProp: string;
    value: string | number | (string | number)[] | boolean | undefined;
  }) => {
    const existField = modifyMap.get(field);
    if (existField) {
      existField[fieldProp] = value;

      if (fieldProp === 'settleTime') {
        existField[fieldProp] = +new Date(value as string);
      } else if (['orderType', 'timeInForce'].includes(fieldProp)) {
        existField[fieldProp] = (value as string[]).join();
      } else if (['openLever'].includes(fieldProp)) {
        existField[fieldProp] = value ? 1 : 0;
      } else if (
        isNumToPercentageProp({
          prop: fieldProp,
        })
      ) {
        existField[fieldProp] = new BigNumber(value as number)
          .dividedBy(100)
          .toNumber();
      }
    } else {
      let fieldValue = value;
      // 特殊处理的几个字段string[]转化成string
      if (['orderType', 'timeInForce', 'permissionTrade'].includes(fieldProp)) {
        fieldValue = (value as string[]).join();
      } else if (['openLever'].includes(fieldProp)) {
        fieldValue = value ? 1 : 0;
      }
      // 时间字符串转化成时间戳
      else if (fieldProp === 'settleTime') {
        fieldValue = +new Date(value as string);
      } else if (
        [
          'limitOrderMaxRate',
          'limitOrderMinRate',
          'marketOrderMaxRate',
          'marketOrderMinRate',
        ].includes(fieldProp)
      ) {
        fieldValue = new BigNumber(value as number).dividedBy(100).toNumber();
      }
      setModifyMap(modifyMap.set(field, { [fieldProp]: fieldValue }));
    }
    return modifyMap;
  };

  const onFinish = async (values: ISpotFormItem) => {
    if (symbolId !== undefined) {
      try {
        const params: ISpotParams = {};
        modifyMap.forEach((value, key) => {
          params[key as keyof ISpotParams] = value;
        });
        const { code, msg } = await spotUpdate({
          ...params,
          symbolId,
          operator: userInfo.name,
          permissionTrade: Array.isArray(values.permissionTrade)
            ? values.permissionTrade.join()
            : '',
        });
        if (code == 0 && !msg) {
          message.success('操作成功');
          reload();
          setVisible(false);
        } else {
          message.error(msg);
        }
      } catch (error) {}
      return;
    }
    Object.entries(formParams).forEach(([key, paramValue]) => {
      if (['permissionTrade'].includes(key)) {
        (formParams[key as keyof ISpotParams] as string) = values[
          key as keyof ISpotFormItem
        ]
          ? (values[key as keyof ISpotFormItem] as string[]).join()
          : '';
      }
      Object.entries(values).forEach(([k, value]) => {
        if (paramValue instanceof Object && Reflect.has(paramValue, k)) {
          paramValue[k] = value;
          if (k === 'settleTime') {
            // 时间字符串转化成时间戳
            paramValue[k] = +new Date(value);
          } else if (
            // 特殊处理的几个字段string[]转化成string
            ['orderType', 'timeInForce'].includes(k)
          ) {
            paramValue[k] = value.join();
          } else if (k === 'openLever') {
            paramValue[k] = value ? 1 : 0;
          } else if (
            isNumToPercentageProp({
              prop: k,
            })
          ) {
            paramValue[k] = new BigNumber(value).dividedBy(100).toNumber();
          }
          setFormParams({ ...formParams });
        }
      });
    });
    try {
      const params = {
        ...formParams,
        operator: userInfo.name,
      };
      const res = await spotCreate(params);
      const { code } = res;
      console.log(1111, res);

      if (code !== 0) {
        // message.error(msg);
        return;
      }
      message.success('操作成功');
      setVisible(false);
      reload();
    } catch (error) {
      console.log(error);
    }
  };

  const getSymbol = useCallback(() => {
    const { baseCurrency, quoteCurrency } = form.getFieldsValue();
    if (baseCurrency && quoteCurrency) {
      if (baseCurrency === quoteCurrency) {
        message.error('基础货币和计价货币不能相同');
        return;
      }
      //现货symbol规则, {基础货币}/{计价货币}

      form.setFieldsValue({
        symbol: `${baseCurrency}/${quoteCurrency}`,
      });
    }
  }, []);

  interface IBaseCurrency {
    currency: string;
  }
  const [baseCurrencyList, setBaseCurrencyList] = useState<IBaseCurrency[]>([]);
  // const [quoteCurrencyList, setQuoteCurrencyList] = useState([]);
  useEffect(() => {
    const getSymbolList = async () => {
      try {
        const res = await symbolList();
        setBaseCurrencyList(res.data);
      } catch (error) {}
    };
    if (visible) {
      getSymbolList();
    }
  }, [visible]);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbolId) return;
      const res = await spotDetail(symbolId);
      if (res.code === 0 && _.isPlainObject(res.data)) {
        setFormParams(res.data);
        Object.entries(res.data).forEach(([key, value]) => {
          if (['permissionTrade'].includes(key)) {
            form.setFieldsValue({
              [key]:
                value && typeof value === 'string'
                  ? value.indexOf(',') > -1
                    ? value.split(',')
                    : [value]
                  : [],
            });
          }
          if (value instanceof Object && value !== null) {
            Object.entries(value as ISpotFormItem).forEach(([k, v]) => {
              form.setFieldValue(k, v);
              if (['orderType', 'timeInForce'].includes(k)) {
                form.setFieldsValue({
                  [k]: v.split(','),
                });
              } else if (
                [
                  'limitOrderMaxRate',
                  'limitOrderMinRate',
                  'marketOrderMaxRate',
                  'marketOrderMinRate',
                ].includes(k)
              ) {
                form.setFieldsValue({
                  [k]: new BigNumber(v).multipliedBy(100).toNumber(),
                });
              }
              if (k === 'symbol') {
                const { symbolInfo } = res.data;
                form.setFieldsValue({
                  symbol: `${symbolInfo.baseCurrency}/${symbolInfo.quoteCurrency}`,
                });
              }
              if (k === 'pricePrecision') {
                setPricePrecision(v);
              }
            });
          }
        });
      }
    };
    if (visible) {
      fetchData();
    }
    if (visible && !symbolId) {
      form.setFieldsValue({ timeInForce: TIME_IN_FORCE_OPTIONS });
      form.setFieldsValue({
        orderType: ORDER_TYPE_OPTIONS_FOR_SPOT.map(
          (orderType) => orderType.value
        ),
      });
      form.setFieldsValue({ openLever: true });
      form.setFieldValue('businessType', businessType);
    }
  }, [visible, symbolId]);

  const onLinePriceRules: {
    pattern?: RegExp;
    required?: boolean;
    message?: string | ReactElement;
  }[] = [{ required: true, message: '请输入上市价格' }];

  if (pricePrecision > 0) {
    onLinePriceRules.push({
      pattern: regexpForDecimal(pricePrecision),
      message: `小数点位最大${pricePrecision}位，请重新输入`,
    });
  }

  return (
    <DrawerForm
      title={`${headerTitle}-参数管理`}
      key="params-positive-perpetual"
      open={visible}
      resize={{
        maxWidth: window.innerWidth * 0.8,
        minWidth: 1340,
      }}
      onOpenChange={setVisible}
      drawerProps={{ destroyOnClose: true }}
      submitTimeout={1500}
      form={form}
      onFinish={onFinish}
    >
      <div>
        <p className="mb-4 h-6 text-base font-semibold leading-6 text-c2">
          参数配置
        </p>
        <ProForm.Group>
          <ProFormSelect
            name="businessType"
            width="md"
            label="类型"
            fieldProps={{ size: 'large' }}
            options={CONTRACT_TYPE_OPTIONS}
            rules={[{ required: true, message: '请选择合约类型' }]}
            disabled
          />
          <ProFormSelect
            name="baseCurrency"
            width="md"
            label="基础货币"
            fieldProps={{ size: 'large', onChange: getSymbol }}
            options={baseCurrencyList.map((item) => ({
              label: item.currency,
              value: item.currency,
            }))}
            disabled={symbolId !== undefined}
            rules={[{ required: true, message: '请选择基础货币' }]}
          />
          <ProFormSelect
            name="quoteCurrency"
            width="md"
            label="计价货币"
            fieldProps={{ size: 'large', onChange: getSymbol }}
            options={baseCurrencyList.map((item) => ({
              label: item.currency,
              value: item.currency,
            }))}
            disabled={symbolId !== undefined}
            rules={[{ required: true, message: '请选择计价货币' }]}
          />

          <ProFormText
            disabled
            width="md"
            name="symbol"
            label="对外展示名称"
            fieldProps={{ size: 'large' }}
          />

          <ProFormDigit
            width="md"
            name="quantityPrecision"
            label="数量小数点位"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'symbolInfo',
                  fieldProp: 'quantityPrecision',
                  value: val as number,
                });
              },
            }}
            tooltip="数量的小数点后的数量，eg: 0.01，此值输入2"
            rules={[
              { required: true, message: '请输入数量小数点位' },
              {
                pattern: /^(0|[1-9]|10)$/,
                message: '请输入0-10之间的整数',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="pricePrecision"
            label="价格小数点位"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                setPricePrecision(val ?? 0);
                if (form.getFieldValue('onlinePrice')) {
                  form.validateFields(['onlinePrice']);
                }
                onFieldChange({
                  field: 'symbolInfo',
                  fieldProp: 'pricePrecision',
                  value: val as number,
                });
              },
            }}
            tooltip="价格的小数点后的数量，eg: 0.01，此值输入2"
            rules={[
              { required: true, message: '请输入价格小数点位' },
              {
                pattern: /^(0|[1-9]|10)$/,
                message: '请输入0-10之间的整数',
              },
            ]}
          />

          <ProFormText
            width="md"
            name="rankWeight"
            label="排名权重"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (e) => {
                onFieldChange({
                  field: 'symbolInfo',
                  fieldProp: 'rankWeight',
                  value: e.target.value,
                });
              },
            }}
            tooltip="交易对在列表中的排序，第一名配置10000"
            rules={[
              { required: true, message: '请输入排名权重' },
              {
                pattern: /^(0|10000|(?!\d{5})\d{1,4})$/,
                message: '请输入0-10000之间的整数',
              },
            ]}
          />

          <ProFormDigit
            width="md"
            name="onlinePrice"
            label="上市价格"
            disabled={
              formParams?.symbolInfo?.symbolStatus ===
              TRADING_PAIR_TRADING_STATUS
            }
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'symbolInfo',
                  fieldProp: 'onlinePrice',
                  value: val as number,
                });
              },
            }}
            tooltip="上市价格精为设置的价格小数点位"
            rules={onLinePriceRules}
          />
        </ProForm.Group>
      </div>
      <div>
        <p className="mb-4 h-6 text-base font-semibold leading-6 text-c2">
          订单参数配置
        </p>
        <ProForm.Group>
          <ProFormDigit
            width="md"
            name="orderAmtLimit"
            label="当前委托（笔数）限制"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'orderAmtLimit',
                  value: val as number,
                });
              },
            }}
            tooltip="用户当前委托笔数总量限制，eg：限制是200，当前最多存在委托单是200笔"
            rules={[
              { required: true, message: '请输入当前委托（笔数）限制' },
              {
                pattern: /^(0|[1-9]\d*)$/,
                message: '请输入正整数',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="limitSingleOrderBalMaxLimit"
            label="限价单最大下单金额限制"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'limitSingleOrderBalMaxLimit',
                  value: val as number,
                });
              },
            }}
            tooltip="系统允许限价单的最大下单金额"
            rules={[
              { required: true, message: '请输入限价单最大下单金额限制' },
              {
                pattern: regexpForDecimal(4),
                message: '小数点位最大4位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="marketSingleOrderBalMaxLimit"
            label="市价单最大下单金额限制"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'marketSingleOrderBalMaxLimit',
                  value: val as number,
                });
              },
            }}
            tooltip="系统允许市价单的最大下单金额"
            rules={[
              { required: true, message: '请输入市价单最大下单金额限制' },
              {
                pattern: regexpForDecimal(4),
                message: '小数点位最大4位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="singleOrderAmtMinLimit"
            label="单笔最小下单数量限制"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'singleOrderAmtMinLimit',
                  value: val as number,
                });
              },
            }}
            tooltip="系统允许的最小下单数量"
            rules={[
              { required: true, message: '请输入单笔最小下单数量限制' },
              {
                pattern: regexpForDecimal(4),
                message: '小数点位最大4位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="singleOrderBalMinLimit"
            label="单笔最小下单金额限制"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'singleOrderBalMinLimit',
                  value: val as number,
                });
              },
            }}
            tooltip="限价和市价按金额下单时允许用户输入的的最小下单金额"
            rules={[
              { required: true, message: '请输入单笔最小下单金额限制' },
              {
                pattern: regexpForDecimal(4),
                message: '小数点位最大4位，请重新输入',
              },
            ]}
          />
          <ProFormText
            width="md"
            name="mergeDepth"
            label="合并深度"
            fieldProps={{
              size: 'large',
              onChange: (e) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'mergeDepth',
                  value: e.target.value,
                });
              },
            }}
            tooltip="用于订单簿聚合展示，逗号隔开"
            rules={[
              { required: true, message: '请输入合并深度' },
              {
                pattern: /^(?:\d+(?:\.\d+)?,){0,9}\d+(?:\.\d+)?$/,
                message: '不能输入非数字，最大不能超过10组，请重新输入',
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormCheckbox.Group
            name="orderType"
            label="订单类型"
            options={ORDER_TYPE_OPTIONS_FOR_SPOT}
            fieldProps={{
              onChange: (checkedValue) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'orderType',
                  value: checkedValue as string[],
                });
              },
            }}
            rules={[{ required: true, message: '请选择订单类型' }]}
          />
          <ProFormCheckbox.Group
            name="timeInForce"
            label="timeInForce"
            options={TIME_IN_FORCE_OPTIONS}
            fieldProps={{
              onChange: (e) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'timeInForce',
                  value: e as string[],
                });
              },
            }}
            rules={[{ required: true, message: '请选择timeInForce' }]}
          />
        </ProForm.Group>
      </div>
      <div>
        <p className="mb-4 h-6 text-base font-semibold leading-6 text-c2">
          订单限制配置
        </p>
        <ProForm.Group>
          <ProFormDigit
            width="md"
            name="limitOrderMaxRate"
            label="限价单价格保护上限"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'limitOrderMaxRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            tooltip="买单的最高买价，eg：设置5%，多单价格≤lastPrice（1+5%）"
            rules={[
              { required: true, message: '请输入限价单价格保护上限' },
              {
                pattern: regexpForPercentage({
                  int: 3,
                  decimal: 4,
                  min: 0,
                  max: 1000,
                }),
                message: '请输入[0,1000]且小数点后保留4位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="limitOrderMinRate"
            label="限价单价格保护下限"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'limitOrderMinRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            tooltip="卖单的最低卖价，eg：设置5%，空单价格价≤lastPrice（1-5%）"
            rules={[
              { required: true, message: '请输入限价单价格保护下限' },
              {
                validator: (rules, value, callback) => {
                  if (value > 100) {
                    callback('限价单价格保护下限不能大于100%');
                  }
                  callback();
                },
              },
              {
                pattern: regexpForPercentage({
                  int: 3,
                  decimal: 4,
                  min: 0,
                  max: 100,
                }),
                message: '请输入[0,100]且小数点后保留4位，请重新输入',
              },
            ]}
          />

          <ProFormDigit
            width="md"
            name="marketOrderMaxRate"
            label="市价单价格保护上限"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'marketOrderMaxRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            tooltip="市价单价最大成交价格，eg：设置1%，多单最高成交价≤标记价格（1+1%）"
            rules={[
              { required: true, message: '请输入市价单价格保护上限' },
              {
                pattern: regexpForPercentage({
                  int: 3,
                  decimal: 4,
                  min: 0,
                  max: 1000,
                }),
                message: '请输入[0,1000]且小数点后保留4位，请重新输入',
              },
            ]}
          />

          <ProFormDigit
            width="md"
            name="marketOrderMinRate"
            label="市价单价格保护下限"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'marketOrderMinRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            tooltip="市价单价最大成交价格，eg：设置1%，多单最高成交价≤标记价格（1+1%）"
            rules={[
              { required: true, message: '请输入市价单价格保护下限' },
              {
                validator: (rules, value, callback) => {
                  if (value > 100) {
                    callback('限价单价格保护下限不能大于100%');
                  }
                  callback();
                },
              },
              {
                pattern: regexpForPercentage({
                  int: 3,
                  decimal: 4,
                  min: 0,
                  max: 100,
                }),
                message: '请输入[0,100]且小数点后保留4位，请重新输入',
              },
            ]}
          />
        </ProForm.Group>
      </div>
      <div>
        <p className="mb-4 h-6 text-base font-semibold leading-6 text-c2">
          交易权限配置
        </p>
        <ProForm.Group>
          <ProFormCheckbox.Group
            width="lg"
            name="permissionTrade"
            label="是否限制交易"
            options={LIMIT_SOURCE_OPTIONS}
          />
        </ProForm.Group>
      </div>
    </DrawerForm>
  );
};
CreateForm.displayName = 'CreateForm';
export default observer(CreateForm);
