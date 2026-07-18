import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'

const SettingsContext = createContext()

const defaultSettings = {
  hours_weekday: '07:00 - 12:00, 12:30 - 16:30',
  hours_saturday: '07:00 - 11:00',
  hours_sunday: 'ZATVORENÉ',
  hours_alert_enabled: 'false',
  hours_alert_message: '',
  hours_alert_type: 'info',
  contact_phone: '+421 903 434 495',
  contact_address: 'Ľubeľa 419, 032 14 Ľubeľa',
  contact_email: 'kubik@stavivalubela.sk',
  billing_name: 'STAVIVÁLUBELA S.R.O.',
  billing_ico: '52 079 716',
  billing_icdph: 'SK2120884161',
  home_hero_bg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2w7e-Vd4pTgIDmk3NZZyBAEv4DfzDFMY3M2Pzdfh8vvRtE8PR2OrmcHp-FSvjqsm5i9po4CUCQVQK1RRL32ahTBRCgy9iHQVU9qK8S9Teeq9QQXQq-9ZrMCLK9b5FtBI6gnbakU8P9wQhu2MQs2tTXcYkmU6hDI4oWxW-7i6cd37-4jFqvh7hmBdC7xK_tmxml1FsfLGoFpaNQQkQBNwp5W5RJ54WJ8oG5wJSCxRnk6PyUwtcraCcx47fNYLh8FQSaRi_VNwbMCqk',
  home_hero_title: 'Všetko pre vašu stavbu na jednom mieste',
  home_cat_hruba: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnXPvfmfX9p55sT5nDwCeB3hzIbGLRzRt0dpb_qe-ka-t6IuUqrLI-rTplyvCqe5Ot3v-h3WyJJ1dxTjm02K5-9rZNyWf9kbpIAkhxedOtP2LR8qPX1-swgxfPZZhWTmB87l_sTnZ_sLcyhIWzqF7B4f5xe5LHrQxyi_EnlgPqBlaMydiJXiitdAabBmhWiEKqplsuSoTkjCkSZel3SvIitzAEDyYRv4QZBvrgUQIiyWbGQCpf5Swt-vb6btxFe4FDBTR65QXBE779',
  home_cat_sucha: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmcTqHxnrA8hz8R093ub3Oe6ZJQGea-g7pitoexYfTGHwfaM9c38FNCilr1Xo4cSRdjQF9-MBzerwreo1R4vp4sKlxmO3bQNo_77J425znvQCmPzuj5a2Ktx9id-CIGadTXZOBB7q7GbxxwDgDkFXYBydAVwU0tVBeeLcDDvhzrTGgQkUaS-gZ4gUkoLexHkVPqzQDIzECJavs_514L6FOCl8GrCADy9dNtgAaLaoe_CRCqSyZ2hgP8D3uNys-9wC-iJM8wktAbpa3',
  home_cat_zahrada: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0FrwZTuoBX4aZ7H9WxgBRiq5ysAFdfL6yE1tuub-3KNCICTwmCcbeVCcoyKoF_KJ0Ps3ehK605v_zn--9hn60jy3sRX0qpF0zJLvC_3XXa-8ZWrhyPMUc8ASuYjzKT8icO6pAeCVm-O7JbK8bGyq_ksXMSH5MiXGmXkfAbrEV6EP6WlP32dmJQ2XF3SMKVjIAlhSWSFGKYiPWqA0EDMzVLU7ZPVNVf9MPtbOEQcgwGqH8DUOVdX2viVbxUZ9pF0IFsCQgAMcRDDBI',
  home_cat_farby: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGKa0QBuZ3nmbJaX837_20pIhGzhn1cgrRhTktRXspPNKdcRddvBCNkAFOUWfVwiX3vhy1ZDf3hrkD1tWv5ZZoeEV1Jyf65Z0pWn073YOOpI4-2jGeLnYQsYa9UTsL_Aha0QjB0hf-wRmv_OhNaO0G7MijYDmpI573ibe6qakzCkFT9xSLhmCXDJ-GNMMtQVvKGLrasjwlvRC4GAuJPXJRtPfG_fpXC8_6TVOe5R9L5Fc2DPlbL78E84oEXW6nNokvhbp07zTLw2Nk'
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const data = await api.settings.get()
      if (data && Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (err) {
      console.error('Error fetching settings from ExoHosting API:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettingState = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettingState, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
