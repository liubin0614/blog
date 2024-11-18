'use client';
import { symbolList } from '@/service/common';
import {
  linearPerpetualContractCreate,
  linearPerpetualContractDetail,
  linearPerpetualContractUpdate,
  riskLimitTemplateList,
} from '@/service/operations/contract';
import { useStore } from '@/store/store';
import { disabledDate, disabledTime } from '@/utils/date-utils';
import {
  regexpForDecimal,
  regexpForInteger,
  regexpForPercentage,
} from '@/utils/util';
import {
  DrawerForm,
  ProForm,
  ProFormCheckbox,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CONTRACT_TYPE_OPTIONS,
  LIMIT_SOURCE_OPTIONS,
  ORDER_TYPE_OPTIONS,
  TIME_IN_FORCE_OPTIONS,
  TRADING_PAIR_INITIAL_STATUS,
  TRADING_PAIR_PREPARE_STATUS,
} from '../constant';
import { ILinearPerpetualFormItem, ILinearPerpetualParams } from '../type';

import isPlainObject from 'lodash/isPlainObject';

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
  businessType = 'linear_perpetual',
  headerTitle = '正向永续',
}) => {
  const [form] = Form.useForm();
  const [formParams, setFormParams] = useState<ILinearPerpetualParams>({
    symbolInfo: {
      businessType: '',
      baseCurrency: '',
      quoteCurrency: '',
      symbol: '',
      ctVal: 0,
      tickSize: 0,
      quantityPrecision: 0,
      pricePrecision: 0,
      rankWeight: 0,
      symbolStatus: 0,
    },
    orderParam: {
      orderAmtLimit: 0,
      mergeDepth: '',
      timeInForce: '',
      orderType: '',
      limitSingleOrderAmtMaxLimit: 0,
      marketSingleOrderAmtMaxLimit: 0,
      singleOrderAmtMinLimit: 0,
      singleOrderBalMinLimit: 0,
    },
    orderLimit: {
      marketOrderRate: 0,
      limitOrderRate: 0,
      basisLimit: 0,
      basisLimitMinute: 0,
      opponentTier: 0,
    },
    positionLimit: {
      positionAmtThreshold: 0,
      positionAmtLimitRate: 0,
      totalPositionAmtLimitRate: 0,
      positionAmtLimit: 0,
      totalPositionAmtLimit: 0,
      riskLimitTemplateId: 0,
      initLever: 0,
    },
    fundingFeeConfig: {
      settlePeriod: 0,
      baseRate: 0,
      impactMarginNotional: 0,
      settleTime: '',
    },
    liquidationParam: {
      liquidationRate: 0,
    },
    permissionOpen: '',
    permissionClose: '',
  });

  const [modifyMap, setModifyMap] = useState(new Map());
  const {
    userInfoStore: { userInfo },
  } = useStore();

  const isArrayToStringProp = ({
    // 数组转化成字符串的字段
    prop,
    propList = [
      'orderType',
      'timeInForce',
      'permissionOpen',
      'permissionClose',
    ],
  }: {
    prop: string;
    propList?: (string | number)[];
  }) => {
    return propList.includes(prop);
  };
  const isNumToPercentageProp = ({
    // 要除以100的数字字段，传递给后端
    prop,
    propList = [
      'marketOrderRate',
      'limitOrderRate',
      'basisLimit',
      'liquidationRate',
      'positionAmtThreshold',
      'positionAmtLimitRate',
      'totalPositionAmtLimitRate',
      'baseRate',
    ],
  }: {
    prop: string;
    propList?: (string | number)[];
  }) => {
    return propList.includes(prop);
  };

  interface IRiskTemplateList {
    templateName: string;
    templateId: number;
    maxLever: number;
  }
  const [riskTemplateList, setRiskTemplateList] = useState<IRiskTemplateList[]>(
    []
  );
  const [riskTemplateMaxLever, setRiskTemplateMaxLever] = useState(0);
  const onFieldChange = ({
    // 表单字段变更时，更新modifyMap
    field,
    fieldProp,
    value,
  }: {
    field: string;
    fieldProp: string;
    value: string | number | (string | number)[] | boolean | undefined;
  }) => {
    if (fieldProp === 'riskLimitTemplateId') {
      const riskTemplate = riskTemplateList.find(
        (item) => item.templateId === value
      );

      if (riskTemplate) {
        setRiskTemplateMaxLever(riskTemplate.maxLever);
      } else {
        setRiskTemplateMaxLever(0);
      }
    }
    const existField = modifyMap.get(field);
    if (existField) {
      existField[fieldProp] = value;

      if (fieldProp === 'settleTime') {
        existField[fieldProp] = +new Date(value as string);
      } else if (
        isArrayToStringProp({
          prop: fieldProp,
        })
      ) {
        existField[fieldProp] = (value as string[]).join();
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
      if (
        isArrayToStringProp({
          prop: fieldProp,
        })
      ) {
        fieldValue = (value as string[]).join();
      }
      // 时间字符串转化成时间戳
      else if (fieldProp === 'settleTime') {
        fieldValue = +new Date(value as string);
      } else if (
        isNumToPercentageProp({
          prop: fieldProp,
        })
      ) {
        fieldValue = new BigNumber(value as number).dividedBy(100).toNumber();
      }
      setModifyMap(modifyMap.set(field, { [fieldProp]: fieldValue }));
    }
    return modifyMap;
  };

  const onFinish = async (values: ILinearPerpetualFormItem) => {
    if (symbolId !== undefined) {
      // 编辑
      try {
        const params: ILinearPerpetualParams = {};
        modifyMap.forEach((value, key) => {
          params[key as keyof ILinearPerpetualParams] = value;
        });
        await linearPerpetualContractUpdate({
          ...params,
          symbolId,
          operator: userInfo.name,
          permissionClose:
            typeof values.permissionClose === 'string'
              ? values.permissionClose
              : values.permissionClose &&
                (values.permissionClose as string[]).join(),
          permissionOpen:
            typeof values.permissionOpen === 'string'
              ? values.permissionOpen
              : values.permissionOpen &&
                (values.permissionOpen as string[]).join(),
        });
        message.success('操作成功');
        reload();
        setVisible(false);
      } catch (error) {}
      return;
    }
    // 新增
    Object.entries(formParams).forEach(([key, paramValue]) => {
      if (['permissionOpen', 'permissionClose'].includes(key)) {
        (formParams[key as keyof ILinearPerpetualParams] as string) = values[
          key as keyof ILinearPerpetualFormItem
        ]
          ? (values[key as keyof ILinearPerpetualFormItem] as string[]).join()
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
            isArrayToStringProp({
              prop: k,
            })
          ) {
            paramValue[k] = value.join();
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
      const { msg, code } = await linearPerpetualContractCreate(params);
      if (code === 0) {
        message.success('操作成功');
        setVisible(false);
        reload();
      } else if (msg) {
        // message.warning(msg);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const riskLimitTemplateId = formParams?.positionLimit?.riskLimitTemplateId;
    if (riskLimitTemplateId && riskTemplateList?.length > 0) {
      const maxLever = riskTemplateList.find(
        (temp) => temp.templateId === riskLimitTemplateId
      )?.maxLever;
      if (maxLever) {
        setRiskTemplateMaxLever(maxLever);
      }
    }
  }, [riskTemplateList, formParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbolId) return;
      const res = await linearPerpetualContractDetail(symbolId);
      setFormParams(res.data);
      Object.entries(res.data).forEach(([key, value]) => {
        if (['permissionOpen', 'permissionClose'].includes(key)) {
          form.setFieldsValue({
            [key]:
              value && typeof value === 'string'
                ? value.indexOf(',') > -1
                  ? value.split(',')
                  : [value]
                : [],
          });
        }
        if (isPlainObject(value) && value) {
          Object.entries(value as ILinearPerpetualFormItem).forEach(
            ([k, v]) => {
              form.setFieldValue(k, v);

              if (k === 'riskLimitTemplateId') {
                // 编辑时获取选中的仓位档位中的最大杠杆倍数，需要和默认杠杆做比较
                const maxLever = riskTemplateList.find(
                  (item) => item.templateId === v
                )?.maxLever;
                console.log(maxLever);
                setRiskTemplateMaxLever(maxLever || 0);
              }
              if (
                isArrayToStringProp({
                  prop: k,
                })
              ) {
                form.setFieldsValue({
                  [k]: v.split(','),
                });
              } else if (
                isNumToPercentageProp({
                  prop: k,
                })
              ) {
                form.setFieldsValue({
                  [k]: new BigNumber(v).multipliedBy(100).toNumber(),
                });
              }
            }
          );
        }
      });
    };
    if (visible) {
      fetchData();
    }

    if (visible && !symbolId) {
      form.resetFields(); // 新增清空表单
      form.setFieldsValue({ timeInForce: TIME_IN_FORCE_OPTIONS }); // 新增时，默认全选
      form.setFieldsValue({
        orderType: ORDER_TYPE_OPTIONS.map((orderType) => orderType.value),
      });
      form.setFieldValue('businessType', businessType);
    }
  }, [visible, symbolId]);

  const ctValDisabled = useMemo(() => {
    // 初始状态&预上市 状态下，合约面值才能修改
    if (
      formParams?.symbolInfo?.symbolStatus &&
      ![TRADING_PAIR_INITIAL_STATUS, TRADING_PAIR_PREPARE_STATUS].includes(
        formParams.symbolInfo.symbolStatus
      )
    ) {
      return true;
    } else {
      return false;
    }
  }, [formParams]);

  const getSymbol = useCallback(() => {
    const { baseCurrency, quoteCurrency } = form.getFieldsValue();
    if (baseCurrency && quoteCurrency) {
      if (baseCurrency === quoteCurrency) {
        return;
      }
      //正向永续symbol规则, {基础货币}-{计价货币}-SWAP
      form.setFieldsValue({
        symbol: `${baseCurrency}-${quoteCurrency}-SWAP`,
      });
    }
  }, []);

  interface IBaseCurrency {
    currency: string;
  }

  const [baseCurrencyList, setBaseCurrencyList] = useState<IBaseCurrency[]>([]);

  useEffect(() => {
    const getSymbolList = async () => {
      try {
        const res = await symbolList();
        // throw new Error()
        setBaseCurrencyList(res.data);
      } catch (error) {}
    };

    const getRiskLimitTemplateList = async () => {
      try {
        const res = await riskLimitTemplateList();
        setRiskTemplateList(res.data);
      } catch (error) {}
    };
    if (visible) {
      getSymbolList();
      getRiskLimitTemplateList();
    }
  }, [visible]);

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
        {/* 新增成功后就不能修改 */}
        <ProForm.Group>
          <ProFormSelect
            name="businessType"
            width="md"
            label="合约类型"
            fieldProps={{ size: 'large' }}
            options={CONTRACT_TYPE_OPTIONS}
            rules={[{ required: true, message: '请选择合约类型' }]}
            disabled
          />
          {/* 新增成功后就不能修改 */}
          <ProFormSelect
            name="baseCurrency"
            width="md"
            label="基础货币"
            fieldProps={{
              size: 'large',
              onChange: getSymbol,
            }}
            options={baseCurrencyList.map((item) => ({
              label: item.currency,
              value: item.currency,
            }))}
            disabled={symbolId ? true : false}
            rules={[
              { required: true, message: '请选择基础货币' },
              () => ({
                validator(_, value) {
                  const { quoteCurrency } = form.getFieldsValue();
                  if (value === quoteCurrency) {
                    return Promise.reject(
                      new Error('基础货币不能与计价货币相同')
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
          {/* 新增成功后就不能修改 */}
          <ProFormSelect
            name="quoteCurrency"
            width="md"
            label="计价货币"
            fieldProps={{
              size: 'large',
              onChange: getSymbol,
            }}
            options={baseCurrencyList.map((item) => ({
              label: item.currency,
              value: item.currency,
            }))}
            disabled={symbolId !== undefined}
            rules={[
              { required: true, message: '请选择计价货币' },
              () => ({
                validator(_, value) {
                  const { baseCurrency } = form.getFieldsValue();
                  if (value === baseCurrency) {
                    return Promise.reject(
                      new Error('计价货币不能与基础货币相同')
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />

          <ProFormText
            disabled
            width="md"
            name="symbol"
            label="对外展示名称"
            fieldProps={{ size: 'large' }}
          />

          {/*  初始状态、预上市、已下市状态下 才能修改 */}
          <ProFormDigit
            name="ctVal"
            label="合约面值"
            width="md"
            tooltip="合约最小交易数量（张），eg：1张=0.001btc"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'symbolInfo',
                  fieldProp: 'ctVal',
                  value: val as number,
                });
              },
              disabled: ctValDisabled,
            }}
            rules={[{ required: true, message: '请输入合约面值' }]}
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
                pattern: regexpForInteger({ int: 1, min: 0, max: 10 }),
                message: '请输入0-10之间的整数',
              },
            ]}
          />
          {/* 新增成功后就不能修改 */}
          <ProFormDigit
            width="md"
            name="tickSize"
            label="最小价格变动"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'symbolInfo',
                  fieldProp: 'tickSize',
                  value: val as number,
                });
              },
            }}
            tooltip="用户订单和行情价格的最小精度，eg: 0.05"
            rules={[{ required: true, message: '请输入最小价格变动' }]}
            disabled={symbolId ? true : false}
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
                  fieldProp: 'tickSize',
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
            name="limitSingleOrderAmtMaxLimit"
            label="限价单笔最大下单数量限制"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'limitSingleOrderAmtMaxLimit',
                  value: val as number,
                });
              },
            }}
            tooltip="系统允许限价单的最大下单数量"
            rules={[
              { required: true, message: '请输入限价单笔最大下单数量限制' },
            ]}
          />
          <ProFormDigit
            width="md"
            name="marketSingleOrderAmtMaxLimit"
            label="市价单笔最大下单数量限制"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'marketSingleOrderAmtMaxLimit',
                  value: val as number,
                });
              },
            }}
            tooltip="系统允许市价单的最大下单数量"
            rules={[
              { required: true, message: '请输入市价单笔最大下单数量限制' },
            ]}
          />
          <ProFormDigit
            width="md"
            name="singleOrderBalMinLimit"
            label="最小下单金额限制"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'singleOrderBalMinLimit',
                  value: val as number,
                });
              },
              maxLength: 10,
            }}
            tooltip="限价和市价按金额下单时允许用户输入的的最小下单金额"
            rules={[
              { required: true, message: '请输入最小下单金额限制' },
              {
                pattern: regexpForDecimal(4),
                message: '请输入数字，小数点后保留4位',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="singleOrderAmtMinLimit"
            label="单笔最小下单数量限制"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderParam',
                  fieldProp: 'singleOrderAmtMinLimit',
                  value: val as number,
                });
              },
              maxLength: 10,
            }}
            tooltip="系统允许的最小下单数量，不区分市价/限价"
            rules={[{ required: true, message: '请输入最小下单金额限制' }]}
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
                  fieldProp: 'singleOrderMinBalLimit',
                  value: e.target.value,
                });
              },
            }}
            tooltip="用于订单簿聚合展示，英文逗号隔开"
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
            options={ORDER_TYPE_OPTIONS}
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
            name="marketOrderRate"
            label="市价单价格保护"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'marketOrderRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            tooltip="市价单价最大成交价格，eg：设置1%，多单最高成交价≤标记价格（1+1%）"
            rules={[
              { required: true, message: '请输入市价单价格保护' },
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
                  decimal: 2,
                  min: 0,
                  max: 100,
                }),
                message: '请输入[0,100]且小数点后保留2位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="limitOrderRate"
            label="限价单价格保护"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'limitOrderRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            tooltip="允许限价单最差的挂单价格，eg：设置5%，多单价格≤标记价格（1+5%）"
            rules={[
              { required: true, message: '请输入限价单价格保护' },
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
                  decimal: 2,
                  min: 0,
                  max: 100,
                }),
                message: '请输入[0,100]且小数点后保留2位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="basisLimit"
            label="基差导致下单限制"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'basisLimit',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            tooltip="基差率超过设置的参数时，单方向不允许下开仓单；eg：5%，当基差率≤5%时，不允许开空。"
            rules={[
              { required: true, message: '请输入基差导致下单限制' },

              {
                pattern: regexpForPercentage({
                  int: 3,
                  decimal: 2,
                  min: 0,
                  max: 1000,
                }),
                message: '请输入[0,1000]且小数点后保留2位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="basisLimitMinute"
            label="基差导致下单限制（分钟）"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'basisLimitMinute',
                  value: val as number,
                });
              },
            }}
            tooltip="基差率超过设置的参数时，单方向不允许下开仓单；eg：5%，当基差率≤5%时，不允许开空。N分钟就是基差率计算周期"
            rules={[
              { required: true, message: '请输入基差导致下单限制（分钟）' },
              {
                pattern: regexpForInteger({ int: 3, min: 1, max: 1000 }),
                message: '请输入1-1000之间的整数',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="opponentTier"
            label="对手N档"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'orderLimit',
                  fieldProp: 'opponentTier',
                  value: val as number,
                });
              },
            }}
            tooltip="市价单对手N档的配置，市价单将采用此档位的价格计算占用保证金"
            rules={[
              { required: true, message: '请输入对手N档' },
              {
                pattern: regexpForInteger({ int: 3, min: 1, max: 1000 }),
                message: '请输入1-1000之间的整数',
              },
            ]}
          />
        </ProForm.Group>
      </div>
      <div>
        <p className="mb-4 h-6 text-base font-semibold leading-6 text-c2">
          强平参数配置
        </p>
        <ProForm.Group>
          <ProFormDigit
            width="md"
            name="liquidationRate"
            label="清算费率"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'liquidationParam',
                  fieldProp: 'liquidationRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            tooltip="强平清算费率"
            rules={[
              { required: true, message: '请输入强平清算费率' },
              {
                pattern: regexpForPercentage({
                  int: 2,
                  decimal: 2,
                  min: 0,
                  max: 100,
                }),
                message: '请输入[0,100]且小数点后保留2位，请重新输入',
              },
            ]}
          />
        </ProForm.Group>
      </div>
      <div>
        <p className="mb-4 h-6 text-base font-semibold leading-6 text-c2">
          仓位限制配置
        </p>
        <ProForm.Group>
          <ProFormDigit
            width="md"
            name="positionAmtThreshold"
            label="启用最大持仓比例阈值"
            tooltip="启动最大持仓比例时，需要合约持仓量≥此阈值，eg：10000btc，合约持仓量≥10000btc时，右侧两个最大持仓比例10%的限制才会生效"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'positionLimit',
                  fieldProp: 'positionAmtThreshold',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            rules={[
              { required: true, message: '请输入启用最大持仓比例阈值' },
              {
                pattern: regexpForPercentage({
                  int: 10,
                  decimal: 2,
                  min: 0,
                  max: 10000000000,
                }),
                message: '精度小数点2位，长度10位。',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="positionAmtLimitRate"
            label="单账户持仓比例限制"
            tooltip="单账户最大持仓比例限制，eg：最大比例限制10%，用户持仓量/交易所持仓量≥10%时，此合约不能再开仓"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'positionLimit',
                  fieldProp: 'positionAmtLimitRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            rules={[
              { required: true, message: '请输入单账户持仓比例限制' },
              {
                pattern: regexpForPercentage({
                  int: 2,
                  decimal: 2,
                  min: 0,
                  max: 100,
                }),
                message: '请输入[0,100]且小数点后保留2位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="totalPositionAmtLimitRate"
            label="母子账户最大持仓量比例限制"
            tooltip="母子账户最大持仓比例限制，eg：最大比例限制10%，用户母子账户持仓量/交易所持仓量≥10%时，此合约母子账户不能再开仓"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'positionLimit',
                  fieldProp: 'totalPositionAmtLimitRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            rules={[
              { required: true, message: '请输入母子账户最大持仓量比例限制' },
              {
                pattern: regexpForPercentage({
                  int: 2,
                  decimal: 2,
                  min: 0,
                  max: 100,
                }),
                message: '请输入[0,100]且小数点后保留2位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="positionAmtLimit"
            label="单账户最大持仓量限制"
            tooltip="单账户最大持仓量限制，eg：最大限制10000btc，用户持仓量在10000btc时，此合约不能再开仓"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'positionLimit',
                  fieldProp: 'positionAmtLimit',
                  value: val as number,
                });
              },
              maxLength: 10,
            }}
            rules={[
              { required: true, message: '请输入单账户最大持仓量限制' },
              {
                pattern: regexpForDecimal(2),
                message: '请输入数字，小数点后保留2位',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="totalPositionAmtLimit"
            label="母子账户最大持仓量限制"
            tooltip="母账户+子账户的最大持仓数量限制，eg：最大限制10000btc，用户母子账户持仓量10000btc时，此合约母子账户都不能再开仓"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'positionLimit',
                  fieldProp: 'totalPositionAmtLimit',
                  value: val as number,
                });
              },
              maxLength: 10,
            }}
            rules={[
              { required: true, message: '请输入母子账户最大持仓量限制' },
              {
                pattern: regexpForDecimal(2),
                message: '请输入数字，小数点后保留2位',
              },
            ]}
          />

          <ProFormSelect
            name="riskLimitTemplateId"
            width="md"
            label="仓位档位"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'positionLimit',
                  fieldProp: 'riskLimitTemplateId',
                  value: val as string,
                });
              },
            }}
            options={riskTemplateList.map((item) => ({
              label: item.templateName,
              value: item.templateId,
            }))}
            tooltip="取仓位档位（梯度限仓）模板"
            rules={[{ required: true, message: '请选择仓位档位' }]}
          />
          <ProFormText
            name="initLever"
            width="md"
            label="默认杠杆"
            fieldProps={{
              size: 'large',
              onChange: (e) => {
                onFieldChange({
                  field: 'positionLimit',
                  fieldProp: 'initLever',
                  value: e.target.value,
                });
              },
            }}
            tooltip="用户端显示的默认杠杆"
            rules={[
              { required: true, message: '请输入默认杠杆' },
              {
                pattern: /^([1-9]\d*)$/,
                message: '请输入正整数',
              },
              () => ({
                validator(_, value) {
                  if (value && Number(value) > Number(riskTemplateMaxLever)) {
                    return Promise.reject(
                      new Error('默认杠杆不能大于仓位档位里面的最大杠杆')
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </ProForm.Group>
      </div>
      <div>
        <p className="mb-4 h-6 text-base font-semibold leading-6 text-c2">
          资金费率配置
        </p>
        <ProForm.Group>
          <ProFormSelect
            name="settlePeriod"
            width="md"
            label="资金费结算周期"
            fieldProps={{
              size: 'large',
              onChange: (val) => {
                onFieldChange({
                  field: 'fundingFeeConfig',
                  fieldProp: 'settlePeriod',
                  value: val as string,
                });
              },
            }}
            options={[
              { label: '8小时', value: 8 },
              { label: '4小时', value: 4 },
            ]}
            tooltip="修改后，下一个周期生效"
            rules={[{ required: true, message: '请选择资金费结算周期' }]}
          />
          <ProFormDigit
            width="md"
            name="baseRate"
            label="基础利率（日）"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'fundingFeeConfig',
                  fieldProp: 'baseRate',
                  value: val as number,
                });
              },
              addonAfter: '%',
            }}
            rules={[
              { required: true, message: '请输入基础利率（日）' },
              {
                pattern: regexpForPercentage({
                  int: 3,
                  decimal: 4,
                  min: 0,
                  max: 1000,
                }),
                message: '小数点后保留4位，请重新输入',
              },
            ]}
          />
          <ProFormDigit
            width="md"
            name="impactMarginNotional"
            label="冲击保证金计算额"
            fieldProps={{
              size: 'large',
              maxLength: 10,
              onChange: (val) => {
                onFieldChange({
                  field: 'fundingFeeConfig',
                  fieldProp: 'impactMarginNotional',
                  value: val as number,
                });
              },
            }}
            tooltip="用于计算资金费率的深度加强价格，冲击金额=冲击保证金计算额*最大杠杆"
            rules={[
              { required: true, message: '请输入冲击保证金计算额' },
              {
                pattern: /^\d+$/,
                message: '请输入整数',
              },
            ]}
          />
          <ProFormDateTimePicker
            name="settleTime"
            width="md"
            label="下次资金费率收取时间"
            tooltip="资金费率下次收取时间"
            fieldProps={{
              size: 'large',
              format: 'YYYY-MM-DD HH:mm:00',
              onChange: (time) => {
                onFieldChange({
                  field: 'fundingFeeConfig',
                  fieldProp: 'settleTime',
                  value: time.format('YYYY-MM-DD HH:mm'),
                });
              },
              disabledTime: disabledTime,
              disabledDate: disabledDate,
            }}
            rules={[{ required: true, message: '请选择下次资金费率收取时间' }]}
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
            name="permissionOpen"
            label="是否限制开仓"
            options={LIMIT_SOURCE_OPTIONS}
          />
          <ProFormCheckbox.Group
            width="lg"
            name="permissionClose"
            label="是否限制平仓"
            options={LIMIT_SOURCE_OPTIONS}
          />
        </ProForm.Group>
      </div>
    </DrawerForm>
  );
};
CreateForm.displayName = 'CreateForm';
export default observer(CreateForm);
